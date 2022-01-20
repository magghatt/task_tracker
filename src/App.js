import logo from './logo.svg';
import './App.css';
import { render } from 'react-dom';
import React, { useState, useEffect } from 'react';
// DataGrid
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import TaskActionsRenderer from './taskActionsRenderer.jsx'
// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
// Date Picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { createTask, updateTask, deleteTask } from './graphql/mutations';
import { listTasks, getTask } from './graphql/queries';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

function App() {
  const [rowData, setRowData] = useState([]);

  const [showEditTask, setShowEditTask] = useState(false);
  const handleCloseEditTask = () => setShowEditTask(false);
  const handleShowEditTask = () => setShowEditTask(true);
  const [editDueDate, setEditDueDate] = useState(new Date());

  // New Task modal
  const [showNewTask, setShowNewTask] = useState(false);
  const handleCloseNewTask = () => setShowNewTask(false);
  const handleShowNewTask = () => setShowNewTask(true);
  // calendar
  const [dueDate, setDueDate] = useState(new Date());

  //let all_tasks = Array();
  useEffect(() => {
    //getAllTasks();
    //setRowData(all_tasks);
    //if(all_tasks) {
      //setRowData(all_tasks);
    //}
  }, []);

  const today = new Date()
  var new_task = {
      title: '',
      description: '',
      due_date: (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear()
  };

  /* create a todo */
  async function createMyTask() {
    handleCloseNewTask();
    console.log(new_task);
    new_task.status = 'New';
    /*const task = {
      title: $('#new-title').value,
      description: $('#new-description').value,
      status: "New",
      due_date: $('#new-due_date').value
    };*/
    try{
      await API.graphql(graphqlOperation(createTask, {input: new_task}));
    } catch(err){ console.log('error adding task') }
  }

  function openEditTaskModal() {
    var id = prompt('Enter ID:')
    getMyTask(id);
    handleShowEditTask();
  }

  async function getMyTask(id) {
    const result = await API.graphql(graphqlOperation(getTask, { input: { id: id }}));
    debugger;
  }

  /* update a todo */
  async function updateMyTask(id) {
    await API.graphql(graphqlOperation(updateTask, { input: { id: id, name: "Updated task info" }}));
  }

  /* delete a todo */
  async function deleteMyTask(id) {
    await API.graphql(graphqlOperation(deleteTask, { input: { id: id }}));
  }

  const getRowNodeId = (data) => data.id;

  async function getAllTasks() {
    try {
      const result = await API.graphql(graphqlOperation(listTasks));
      return result;
    } catch(e) {
      console.log(e);
    }
  }

  function renderAllTasks() {
    const result = getAllTasks();
    // .then((value) => JSON.parse(value))
    var all_tasks = Array();
    result.then((value) => {
      console.log('items array?:'+ Array.isArray(value.data.listTasks.items))
      const tasks = value.data.listTasks.items;
      //gridOptions.setRowData(tasks)
      //return tasks;
      //console.log('all_tasks:' + typeof all_tasks)
      for (var i = 0; i < tasks.length; i++) {
        //console.log(tasks[i]);
        var t = tasks[i];
        all_tasks.push({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          due_date: t.due_date
        });
        /*all_tasks.push({
          id: i, //t.id,
          title: 'title', //t.title,
          description: 'descript', //t.description,
          status: 'status', //t.status,
          due_date: 'asap', //t.due_date
        });*/
      }
      //setRowData(all_tasks);
      console.log('all_tasks array:' + Array.isArray(all_tasks))
      console.log(all_tasks)
      immutable_tasks = all_tasks;
      //debugger
      //return all_tasks;
    });
    /*return [
      { id: 1, title: 'title', description: 'descript', status: 'status', due_date: 'asap' },
      { id: 2, title: 'title', description: 'descript', status: 'status', due_date: 'asap' },
      { id: 3, title: 'title', description: 'descript', status: 'status', due_date: 'asap' },
      { id: 4, title: 'title', description: 'descript', status: 'status', due_date: 'asap' },
      { id: 5, title: 'title', description: 'descript', status: 'status', due_date: 'asap' },
    ];*/
  }

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  var immutable_tasks;

  return (
    <div className="App">
      <header className="App-header">
        <h3 className="justify-content-center">
          Task Tracker
          <Button onClick={handleShowNewTask} size="sm">New Task</Button>
          <Button id="edit-task-button" onClick={openEditTaskModal} size="sm">Edit</Button>
          <Button onClick={renderAllTasks} size="sm">Fetch</Button>
        </h3>

        <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
          <AgGridReact
            frameworkComponents={{taskActionsRenderer: TaskActionsRenderer}}
            getRowNodeId={function (data) {
                return data.id;
              }}
            onGridReady={(params) => {
              setGridApi(params.api);
              //setGridColumnApi(params.columnApi);

              immutable_tasks = [];
              renderAllTasks();
              setTimeout(() => {params.api.setRowData(immutable_tasks);}, 1000);
            }}
            immutableData={true}
            >
              <AgGridColumn field="id" headerName="" cellRenderer="taskActionsRenderer" width="150" type="justify"></AgGridColumn>
              <AgGridColumn field="status" sortable={true}></AgGridColumn>
              <AgGridColumn field="title" sortable={true}></AgGridColumn>
              <AgGridColumn field="description" sortable={true}></AgGridColumn>
              <AgGridColumn field="due_date" headerName="Due Date" sortable={true}></AgGridColumn>
          </AgGridReact>
        </div>
      </header>

      <Modal
        id="new-task-modal"
        show={showNewTask}
        onHide={handleCloseNewTask}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <InputGroup className="mb-3">
            <InputGroup.Text>Due Date</InputGroup.Text>
            <span className="form-control">
              <DatePicker id="new-due_date" className="form-control datepicker-input"
                selected={dueDate} onChange={(date) => {
                  setDueDate(date)
                  new_task.due_date = date;
                  console.log(new_task);
                }} />
            </span>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">Title</InputGroup.Text>
            <FormControl id="new-title" aria-label="Title" aria-describedby="inputGroup-sizing-default"
              onChange={(e) => {
                new_task.title = e.target.value;
                console.log(new_task);
              }}
            />
          </InputGroup>

          <InputGroup>
            <InputGroup.Text>Description</InputGroup.Text>
            <FormControl as="textarea" id="new-description" aria-label="Description"
              onChange={(e) => {
                new_task.description = e.target.value;
                console.log(new_task);
              }}/>
          </InputGroup>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="md" onClick={handleCloseNewTask}>
            Close
          </Button>
          <Button variant="primary" onClick={createMyTask}>Save</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        id="edit-task-modal"
        show={showEditTask}
        onHide={handleCloseEditTask}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <InputGroup className="mb-3">
            <InputGroup.Text>Due Date</InputGroup.Text>
            <span className="form-control">
              <DatePicker id="new-due_date" className="form-control datepicker-input"
                selected={editDueDate} onChange={(date) => setEditDueDate(date)} />
            </span>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">Title</InputGroup.Text>
            <FormControl
              id="new-title"
              aria-label="Title"
              aria-describedby="inputGroup-sizing-default"
            />
          </InputGroup>

          <InputGroup>
            <InputGroup.Text>Description</InputGroup.Text>
            <FormControl as="textarea" id="new-description" aria-label="Description" />
          </InputGroup>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="md" onClick={handleCloseEditTask}>
            Close
          </Button>
          <Button variant="primary" onClick={createMyTask}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
