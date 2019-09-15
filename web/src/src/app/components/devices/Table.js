import React, { useState } from 'react';
import MaterialTable from 'material-table';
import Snackbar from '../shared/Snackbar';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import BlockIcon from '@material-ui/icons/Block';
import QRCode from 'qrcode-react';

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
    console.log(result);
  } else {
    setSnackbar({
      open: true,
      message: 'Fail!',
      variant: 'error'
    });
    console.log(result);
  }
};

const MaterialTableDemo = ({
  devices,
  updateDevice,
  addDevice,
  removeDevice
}) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    variant: '',
    message: ''
  });
  const [state, setState] = React.useState({
    columns: [
      { title: 'Id', field: 'id', editable: 'never' },
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
        render: rowData => {
          var isLent =
            rowData && !!rowData.transactions.find(x => !x.returnDate);
          return isLent ? <BlockIcon /> : <CheckCircleIcon />;
        }
      }
    ],
    data: [...devices]
  });

  return (
    <>
      <Snackbar {...snackbar} setSnackbar={setSnackbar} />
      <MaterialTable
        title="Devices"
        columns={state.columns}
        data={state.data}
        detailPanel={[
          {
            tooltip: 'Historoies',
            render: rowData => {
              return (
                <>
                  <div
                    style={{
                      fontSize: 14,
                      paddingLeft: 10
                    }}
                  >
                    {rowData.transactions.map((x, index) => (
                      <div key={index}>{`${x.email} lent on ${
                        x.lendingDate
                      }} and ${x.returnDate &&
                        `returned on ${x.returnDate}`}`}</div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <QRCode value={rowData.id} />
                  </div>
                </>
              );
            }
          }
        ]}
        // actions={[
        //   rowData => ({
        //     icon: 'block',
        //     tooltip: 'Deactive User',
        //     onClick: (event, rowData) => {
        //       handleDeviceStatus(
        //         updateDevice,
        //         rowData,
        //         state,
        //         setState,
        //         setSnackbar
        //       );
        //     },
        //     hidden: !rowData.active
        //   }),
        //   rowData => ({
        //     icon: 'check',
        //     tooltip: 'Active User',
        //     onClick: (event, rowData) => {
        //       handleDeviceStatus(
        //         updateDevice,
        //         rowData,
        //         state,
        //         setState,
        //         setSnackbar
        //       );
        //     },
        //     hidden: rowData.active
        //   })
        // ]}
        options={{
          actionsColumnIndex: -1,
          exportButton: true
        }}
        editable={{
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
              addDevice({
                name: newData.name,
                imeiNumber: newData.imeiNumber,
                model: newData.model
              }).then(result => {
                if (result) {
                  const data = [
                    ...state.data,
                    { ...resolve, transactions: [] }
                  ];
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
        }}
      />
    </>
  );
};

export default MaterialTableDemo;
