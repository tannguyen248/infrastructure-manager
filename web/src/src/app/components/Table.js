import React from 'react';
import MaterialTable from 'material-table';

const handleUserStatus = (user, state, setDataState) => {
  const data = [...state.data];
  data[data.indexOf(user)] = { ...user, active: !user.active };
  setDataState({ ...state, data });
};

const MaterialTableDemo = () => {
  const [state, setState] = React.useState({
    columns: [
      { title: 'Id', field: 'id' },
      { title: 'Name', field: 'name' },
      { title: 'Email', field: 'email' },
      {
        title: 'Role',
        field: 'role'
      },
      { title: 'Team', field: 'team' }
    ],
    data: [
      {
        id: '1',
        name: 'Mehmet',
        email: '@gmail.com',
        role: 'user',
        team: 'Blizzard',
        active: true
      },
      {
        id: '2',
        name: 'kehmet',
        email: '1@gmail.com',
        role: 'user',
        team: 'Blizzard',
        active: true
      },
      {
        id: '3',
        name: 'Zehmet',
        email: '2@gmail.com',
        role: 'user',
        team: 'Blizzard',
        active: false
      },
      {
        id: '4',
        name: 'Hehmet',
        email: '3@gmail.com',
        role: 'user',
        team: 'Tor',
        active: false
      },
      {
        id: '5',
        name: 'Zehmet',
        email: '5@gmail.com',
        role: 'user',
        team: 'Tor',
        active: false
      }
    ]
  });

  return (
    <MaterialTable
      title="Users"
      columns={state.columns}
      data={state.data}
      actions={[
        rowData => ({
          icon: 'block',
          tooltip: 'Deactive User',
          onClick: (event, rowData) => {
            handleUserStatus(rowData, state, setState);
          },
          hidden: !rowData.active
        }),
        rowData => ({
          icon: 'check',
          tooltip: 'Active User',
          onClick: (event, rowData) => {
            handleUserStatus(rowData, state, setState);
          },
          hidden: rowData.active
        })
      ]}
      options={{
        actionsColumnIndex: -1,
        rowStyle: rowData => ({
          backgroundColor: rowData.active ? '#FFF' : '#EEE'
        })
      }}
      editable={{
        onRowAdd: newData =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data.push(newData);
              setState({ ...state, data });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data[data.indexOf(oldData)] = newData;
              setState({ ...state, data });
            }, 600);
          }),
        onRowDelete: oldData =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const data = [...state.data];
              data.splice(data.indexOf(oldData), 1);
              setState({ ...state, data });
            }, 600);
          })
      }}
    />
  );
};

export default MaterialTableDemo;
