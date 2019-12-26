import Input from '@material-ui/core/Input';
import BlockIcon from '@material-ui/icons/Block';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MaterialTable from 'material-table';
import QRCode from 'qrcode-react';
import React, { useState, useCallback } from 'react';
import XLSX from 'xlsx';
import Snackbar from '../shared/Snackbar';
import { Button } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

const mockData = [
  {
    name: 'iphone 7',
    imeiNumber: '1234567',
    model: 'xs max'
  },
  {
    name: 'iphone 8',
    imeiNumber: '123458',
    model: 'xs max'
  }
];

const handleDeviceStatus = async (
  updateDevice,
  oldData,
  newData,
  state,
  setDataState,
  setSnackbar
) => {
  const data = [...state.data];
  data[data.indexOf(oldData)] = newData;

  const result = await updateDevice(oldData.id, {
    name: newData.name,
    model: newData.model,
    imeiNumber: newData.imeiNumber
  });

  if (result) {
    setDataState({ ...state, data });
    setSnackbar({
      open: true,
      message: 'Update successfully!',
      variant: 'success'
    });
  } else {
    setSnackbar({
      open: true,
      message: 'Fail!',
      variant: 'error'
    });
  }
};

const DeviceTable = ({
  devices,
  updateDevice,
  addDevice,
  removeDevice,
  revokeDevice,
  auth
}) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    variant: '',
    message: ''
  });

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const customColumns = [
    auth && auth.username === 'admin'
      ? { title: 'Id', field: 'id', editable: 'never' }
      : {},
    { title: 'Name', field: 'name' },
    { title: 'imeiNumber', field: 'imeiNumber' },
    {
      title: 'Model',
      field: 'model'
    },
    {
      field: 'available',
      title: 'Available',
      editable: 'never',
      customSort: (rowData1, rowData2) => {
        var isLent1 =
          rowData1.transaction && rowData1.transaction.status === 'assigned';
        var isLent2 =
          rowData2.transaction && rowData2.transaction.status === 'assigned';

        return isLent1 === isLent2 ? 0 : isLent1 ? 1 : -1;
      },
      render: rowData => {
        var isLent =
          rowData &&
          rowData.transaction &&
          rowData.transaction.status === 'assigned';
        return isLent ? (
          <BlockIcon color='error' />
        ) : (
          <CheckCircleIcon color='primary' />
        );
      }
    }
  ];

  const [state, setState] = React.useState({
    columns: customColumns,
    data: [...devices]
  });

  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [workbook, setWorkbook] = useState(null);

  const handleClick = e => {
    if (workbook && workbook.Sheets) {
      const selectedSheetForImporting = XLSX.utils.sheet_to_json(
        workbook.Sheets[selectedSheet],
        { raw: true }
      );
      const parsedData = getParseData(selectedSheetForImporting);

      const allDeviceImeiNumber = devices.map(device => device.imeiNumber);

      let newlyAddDevices = [];

      if (allDeviceImeiNumber && allDeviceImeiNumber.length === 0) {
        newlyAddDevices = parsedData;
      } else {
        newlyAddDevices = parsedData.filter(res => {
          return allDeviceImeiNumber.indexOf(res.imeiNumber) === -1;
        });
      }

      newlyAddDevices.forEach(res => {
        addDevice({
          name: res.name,
          imeiNumber: res.imeiNumber,
          model: res.model
        });
      });
    }
  };

  const handleSelect = useCallback(e => {
    setSelectedSheet(e.target.value);
  }, []);

  const handleFileChosen = e => {
    const data = new Uint8Array(e.target.result);
    const importedExcel = XLSX.read(data, { type: 'array' });

    setSheets(importedExcel.Sheets);
    setWorkbook(importedExcel);
  };

  const importDevices = useCallback(
    e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = handleFileChosen;
      reader.readAsArrayBuffer(file);
    },
    [addDevice, devices]
  );

  const editable = () => {
    if (auth && auth.username === 'admin') {
      return {
        onRowAdd: newData =>
          new Promise((resolve, reject) => {
            addDevice({
              name: newData.name,
              imeiNumber: newData.imeiNumber,
              model: newData.model
            }).then(result => {
              if (result) {
                const data = [...state.data, { ...resolve, transactions: [] }];
                setState({ ...state, data });
                setSnackbar({
                  open: true,
                  message: 'Add successfully!',
                  variant: 'success'
                });

                resolve();
              } else {
                setSnackbar({
                  open: true,
                  message: 'Fail!',
                  variant: 'error'
                });

                reject();
              }
            });
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              handleDeviceStatus(
                updateDevice,
                oldData,
                newData,
                state,
                setState,
                setSnackbar
              );
            }, 600);
          }),
        onRowDelete: oldData =>
          new Promise((resolve, reject) => {
            removeDevice(oldData.id).then(result => {
              if (result === true) {
                const data = [...state.data];
                data.splice(data.indexOf(oldData), 1);
                setState({ ...state, data });
                setSnackbar({
                  open: true,
                  message: 'Remove successfully!',
                  variant: 'success'
                });

                resolve();
              } else {
                setSnackbar({
                  open: true,
                  message: 'Fail!',
                  variant: 'error'
                });

                reject();
              }
            });
          })
      };
    } else {
      return {};
    }
  };

  const customActions =
    auth && auth.username === 'admin'
      ? [
          {
            icon: 'cached',
            tooltip: 'Revoke this device',
            onClick: (e, rowData) =>
              new Promise((resolve, reject) => {
                if (rowData.transaction && rowData.transaction.status === '') {
                  setSnackbar({
                    open: true,
                    message: 'Device is available. No need to revoke',
                    variant: 'error'
                  });
                } else {
                  if (
                    rowData.id &&
                    rowData.transaction &&
                    rowData.transaction.id
                  ) {
                    revokeDevice(rowData.id, rowData.transaction.id)
                      .then(result => {
                        setSnackbar({
                          open: true,
                          message: 'Revoke device successfully!',
                          variant: 'success'
                        });
                        resolve();
                      })
                      .catch(err => {
                        setSnackbar({
                          open: true,
                          message: 'Failed to revoke device!',
                          variant: 'error'
                        });
                        reject();
                      });
                  } else {
                    setSnackbar({
                      open: true,
                      message: 'Failed to revoke device!',
                      variant: 'error'
                    });
                    reject();
                  }
                }
              }),
            disabled: !auth
          }
        ]
      : [];

  return (
    <>
      <Snackbar {...snackbar} handleClose={handleClose} />
      <MaterialTable
        title='Devices'
        columns={state.columns}
        data={devices}
        detailPanel={[
          {
            tooltip: 'Histories',
            render: rowData => {
              return (
                <>
                  <div
                    style={{
                      fontSize: 14,
                      paddingLeft: 10
                    }}
                  >
                    {rowData.transaction && (
                      <div>{`${rowData.transaction.email &&
                        rowData.transaction.email} lent on ${rowData.transaction
                        .lendingDate &&
                        rowData.transaction.lendingDate.toDate()}`}</div>
                    )}
                  </div>
                  {auth && auth.username === 'admin' && (
                    <div style={{ textAlign: 'center' }}>
                      <QRCode value={rowData.id} />
                    </div>
                  )}
                </>
              );
            }
          }
        ]}
        options={{
          actionsColumnIndex: -1,
          sorting: true,
          headerStyle: {
            backgroundColor: '#3f51b5',
            color: '#FFF'
          }
        }}
        editable={editable()}
        actions={customActions}
      />

      {auth && auth.username === 'admin' ? (
        <ImportDevice
          importDevices={importDevices}
          selectedSheet={selectedSheet}
          devices={devices}
          addDevice={addDevice}
          handleSelect={handleSelect}
          sheets={sheets}
          handleClick={handleClick}
        />
      ) : null}
    </>
  );
};

const getParseData = selectedSheetForImporting => {
  if (selectedSheetForImporting) {
    return selectedSheetForImporting.map(device => {
      return {
        name: device.Devices || '',
        model: device['Android/iOS'] || '',
        imeiNumber: device['Serial Number/IMEI'] || ''
      };
    });
  }
  return mockData;
};

const ImportDevice = ({
  devices,
  addDevice,
  importDevices,
  selectedSheet,
  handleSelect,
  sheets,
  handleClick,
  ...props
}) => {
  return (
    <div style={{ display: 'flex', marginTop: '24px' }}>
      <span>
        <Input color='secondary' type='file' onChange={importDevices} />
      </span>
      <span style={{ marginLeft: '24px' }}>
        <InputLabel id='demo-simple-select-label'>
          Select sheet to import
        </InputLabel>
        <Select
          id='demo-simple-select'
          value={selectedSheet || ''}
          onChange={handleSelect}
        >
          {Object.keys(sheets).map((key, index) => {
            return (
              <MenuItem value={key} key={index}>
                {key}
              </MenuItem>
            );
          })}
        </Select>
      </span>
      <span>
        <Button
          variant='outlined'
          color='primary'
          onClick={handleClick}
          style={{ marginLeft: '10px' }}
        >
          Import devices
        </Button>
      </span>
    </div>
  );
};

export default DeviceTable;
