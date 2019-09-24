import React, { useState } from 'react';
import MaterialTable from 'material-table';
import Snackbar from '../shared/Snackbar';
import { stat } from 'fs';
import { sortBy } from '../../helper';

const handleUserStatus = async (
  updateUser,
  rowData,
  state,
  setDataState,
  setSnackbar
) => {
  const data = [...state.data];
  const user = { ...rowData, active: !rowData.active };
  data[data.indexOf(rowData)] = user;

  const result = await updateUser(rowData.id, {
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active
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

const MaterialTableDemo = ({ users, updateUser, deactiveUser }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    variant: '',
    message: ''
  });
  const [state, setState] = React.useState({
    columns: [
      { title: 'Id', field: 'id' },
      { title: 'Name', field: 'name' },
      { title: 'Email', field: 'email' },
      {
        title: 'Role',
        field: 'role'
      }
      //{ title: 'Team', field: 'team' }
    ],
    data: [...users]
  });

  console.log([...users]);
  console.log(state.data);
  return (
    <>
      <Snackbar {...snackbar} setSnackbar={setSnackbar} />
      <MaterialTable
        title="Users"
        columns={state.columns}
        data={state.data}
        detailPanel={[
          {
            tooltip: 'Historoies',
            render: rowData => {
              console.log(rowData);
              return (
                <div
                  style={{
                    fontSize: 14,
                    paddingLeft: 10
                  }}
                >
                  {rowData.histories && sortBy(rowData.histories,  {prop: 'date'}) &&
                    rowData.histories.map((x, index) => (
                      <div key={index}>{`${x.name} ${x.imei} is ${
                        x.event
                      } on ${x.date.toDate()}}`}</div>
                    ))}
                </div>
              );
            }
          }
        ]}
        // actions={
        //   [
        //     // rowData => ({
        //     //   icon: 'block',
        //     //   tooltip: 'Deactive User',
        //     //   onClick: (event, rowData) => {
        //     //     handleUserStatus(
        //     //       updateUser,
        //     //       rowData,
        //     //       state,
        //     //       setState,
        //     //       setSnackbar
        //     //     );
        //     //   },
        //     //   hidden: !rowData.active
        //     // }),
        //     // rowData => ({
        //     //   icon: 'check',
        //     //   tooltip: 'Active User',
        //     //   onClick: (event, rowData) => {
        //     //     handleUserStatus(
        //     //       updateUser,
        //     //       rowData,
        //     //       state,
        //     //       setState,
        //     //       setSnackbar
        //     //     );
        //     //   },
        //     //   hidden: rowData.active
        //     // })
        //   ]
        // }
        options={{
          actionsColumnIndex: -1,
          rowStyle: rowData => ({
            backgroundColor: rowData.active ? '#FFF' : '#EEE'
          }),
          exportButton: true
        }}
        editable={
          {
            onRowAdd: newData =>
              new Promise( (resolve, reject) => {
                setTimeout(() => {
                  resolve();
                  const data = [...state.data];
                  data.push(newData);
                  setState({ ...state, data });
                }, 600);
              }),
            // onRowUpdate: (newData, oldData) =>
            //   new Promise(resolve => {
            //     setTimeout(() => {
            //       resolve();
            //       const data = [...state.data];
            //       data[data.indexOf(oldData)] = newData;
            //       setState({ ...state, data });
            //     }, 600);
            //   })
            // onRowDelete: oldData =>
            //   new Promise(resolve => {
            //     setTimeout(() => {
            //       resolve();
            //       const data = [...state.data];
            //       data.splice(data.indexOf(oldData), 1);
            //       setState({ ...state, data });
            //     }, 600);
            //   })
          }
        }
        actions={[{
          icon: 'eject',
          tooltip: 'Deactive this user',
          onClick: (e, rowData) => new Promise((resolve, reject) => {
            deactiveUser(rowData.email).then(result => {
              setSnackbar({
                open: true,
                variant: 'success',
                message: 'Deactive user successful'
              });
              resolve();
            }).catch(err => {
              setSnackbar({
                open: true,
                variant: 'error',
                message: 'Failed to deactive user'
              });
              reject();
            })
          })
        }]}
      />
    </>
  );
};

export default MaterialTableDemo;
