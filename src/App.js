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
import Form from 'react-bootstrap/Form'
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
  // Data grid
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  // Date picker
  const [dueDate, setDueDate] = useState(new Date());
  // New Task modal
  const [showNewTask, setShowNewTask] = useState(false);
  const handleCloseNewTask = () => setShowNewTask(false);
  const handleShowNewTask = () => setShowNewTask(true);
  // Edit Task modal
  const [showEditTask, setShowEditTask] = useState(false);
  const handleCloseEditTask = () => setShowEditTask(false);
  const handleShowEditTask = () => setShowEditTask(true);
  const [editDueDate, setEditDueDate] = useState(new Date());
  // Delete Task Modal
  const [showDeleteTask, setShowDeleteTask] = useState(false);
  const handleCloseDeleteTask = () => setShowDeleteTask(false);
  const handleShowDeleteTask = () => setShowDeleteTask(true);

  const [refs] = useState({
    edit_task: {
      id: React.createRef(),
      title: React.createRef(),
      description: React.createRef(),
      due_date: React.createRef(),
      status: React.createRef()
    }
  });
  const [vars] = useState({
    new_task: {
      title: '',
      description: '',
      due_date: ''
    },
    edit_task: {
      id: '',
      title: '',
      description: '',
      due_date: '',
      status: ''
    },
    delete_task: {
      id: null
    },
    gridApiRef: null,
  });

  // New Task
  function openNewTaskModal() {
    const today = new Date();
    const simple_date = (today.getMonth() + 1) +'/'+ today.getDate() +'/'+ today.getFullYear()
    vars.new_task.due_date = simple_date;
    handleShowNewTask();
  }
  async function createMyTask() {
    handleCloseNewTask();
    // Toodo:
    // - check required fields
    vars.new_task.status = 'New';
    await API.graphql(graphqlOperation(createTask, {input: vars.new_task}));
    clear_task(vars.new_task);
    renderAllTasks();
  }

  // Edit Task
  async function getMyTask(task_id) {
    try {
      const result = await API.graphql(graphqlOperation(getTask, { id: task_id }));
      return result;
    } catch(e) {
      console.log(e);
    }
  }
  function openEditTaskModal(task_id) {
    const result = getMyTask(task_id);
    result.then((value) => {
      var t = value.data.getTask;
      vars.edit_task = t;
      handleShowEditTask();
    });
  }
  async function updateMyTask() {
    // Todo:
    // - check required fields
    var edit_task = {
      id: vars.edit_task.id,
      title: vars.edit_task.title,
      description: vars.edit_task.description,
      due_date: vars.edit_task.due_date,
      status: vars.edit_task.status
    }
    await API.graphql(graphqlOperation(updateTask, { input: edit_task }));
    closeEditTaskModal();
    renderAllTasks();
  }
  function closeEditTaskModal() {
    clear_task(vars.edit_task);
    handleCloseEditTask();
  }
  function clear_task(task) {
    task = {
      id: '',
      title: '',
      description: '',
      due_date: '',
      status: ''
    };
  }

  // Delete Task
  function openDeleteTaskModal(task_id) {
    vars.delete_task.id = task_id;
    handleShowDeleteTask();
  }
  async function deleteMyTask(id) {
    if(vars.delete_task.id) {
      await API.graphql(graphqlOperation(deleteTask, { input: { id: vars.delete_task.id }}));
      closeDeleteTaskModal();
      renderAllTasks();
    }
  }
  function closeDeleteTaskModal() {
    vars.delete_task.id = null;
    handleCloseDeleteTask();
  }

  // Data Grid:
  function renderAllTasks() {
    const result = getAllTasks();
    result.then((value) => {
      const tasks = value.data.listTasks.items;
      tasks.map((task) => {
        const date_parts = task.due_date.split('/');
        const year = date_parts[2]
        const month = date_parts[0] - 1
        const day = date_parts[1]
        task.due_date = new Date(year, month, day)
      });
      vars.gridApiRef.setRowData(tasks);
    });
  }
  async function getAllTasks() {
    try {
      const result = await API.graphql(graphqlOperation(listTasks));
      return result;
    } catch(e) {
      console.log(e);
    }
  }
  function caseInsensitiveCompare(leftVal, rightVal) {
    const lower_left = leftVal.toLowerCase()
    const lower_right = rightVal.toLowerCase()
    return lower_left.localeCompare(lower_right)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h3 className="justify-content-center">
          Task Tracker
          <Button onClick={openNewTaskModal} size="sm" className="new-task-button">Create</Button>
        </h3>
        <div className="ag-theme-alpine" style={{height: 500, width: 1000}}>
          <AgGridReact
            frameworkComponents={{taskActionsRenderer: TaskActionsRenderer}}
            immutableData={true}
            getRowNodeId={(data) => { return data.id; }}
            onGridReady={(params) => {
              vars.gridApiRef = params.api;
              setGridApi(params.api);
              renderAllTasks();
            }}
            >
              <AgGridColumn field="id" headerName="" width={150}
                cellRenderer="taskActionsRenderer"
                cellRendererParams={{
                  handleEditTask: openEditTaskModal,
                  handleDeleteTask: openDeleteTaskModal
                }}
              ></AgGridColumn>
              <AgGridColumn field="status" sortable={true} width={125}></AgGridColumn>
              <AgGridColumn field="due_date" headerName="Due Date" sortable={true} width={125}
              valueFormatter={(params) => {
                const today = params.data.due_date
                const simple_date = (today.getMonth() + 1) +'/'+ today.getDate() +'/'+ today.getFullYear()
                return simple_date
              }}
              ></AgGridColumn>
              <AgGridColumn field="title" sortable={true} width={250}
                comparator={caseInsensitiveCompare}
              ></AgGridColumn>
              <AgGridColumn field="description" sortable={true} width={345}
                comparator={caseInsensitiveCompare}
              ></AgGridColumn>
          </AgGridReact>
        </div>
      </header>

      <Modal id="new-task-modal"
        show={showNewTask}
        onHide={handleCloseNewTask}
        backdrop={true}
        keyboard={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <InputGroup className="mb-3">
            <InputGroup.Text>Due Date</InputGroup.Text>
            <span className="form-control">
              <DatePicker id="new-due_date" className="form-control datepicker-input"
                selected={dueDate}
                value={vars.new_task.due_date}
                onChange={(date) => {
                  var simple_date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
                  vars.new_task.due_date = simple_date;
                  setDueDate(date)
                }}
              />
            </span>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">Title</InputGroup.Text>
            <FormControl id="new-title" aria-label="Title" aria-describedby="inputGroup-sizing-default"
              placeholder="Enter name.."
              onChange={(e) => {
                vars.new_task.title = e.target.value;
              }}
            />
          </InputGroup>

          <InputGroup>
            <InputGroup.Text>Description</InputGroup.Text>
            <FormControl as="textarea" id="new-description" aria-label="Description"
              placeholder="Enter description.."
              onChange={(e) => {
                vars.new_task.description = e.target.value;
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

      <Modal id="edit-task-modal"
        show={showEditTask}
        onHide={handleCloseEditTask}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>Status</InputGroup.Text>
            <Form.Select aria-label="task status"
              ref={refs.edit_task.status}
              value={vars.edit_task.status}
              onChange={(e) => {
                vars.edit_task.status = e.target.value
                // Not sure why this doesn't work seamlessly on Select as it does with Text
                setTimeout(() => {
                  const val = vars.edit_task.status
                  console.log('selected: '+ val)
                  vars.edit_task.status = val
                  refs.edit_task.status.current.value = val
                }, 1);
              }}
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Form.Select>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text>Due Date</InputGroup.Text>
            <span className="form-control">
              <DatePicker id="new-due_date" className="form-control datepicker-input"
                selected={editDueDate}
                ref={refs.edit_task.due_date}
                value={vars.edit_task.due_date}
                onChange={(date) => {
                  var simple_date = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
                  vars.edit_task.due_date = simple_date;
                  refs.edit_task.due_date.current.value = simple_date;
                  setEditDueDate(date)
                }} />
            </span>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">Title</InputGroup.Text>
            <FormControl id="edit-title" aria-label="Title" aria-describedby="inputGroup-sizing-default"
              ref={refs.edit_task.title}
              defaultValue={vars.edit_task.title}
              onChange={(e) => {
                const value = e.target.value;
                vars.edit_task.title = value;
                refs.edit_task.title.current.value = value;
              }}
            />
          </InputGroup>
          <InputGroup>
            <InputGroup.Text>Description</InputGroup.Text>
            <FormControl as="textarea" id="new-description" aria-label="Description"
              ref={refs.edit_task.description}
              defaultValue={vars.edit_task.description}
              onChange={(e) => {
                const value = e.target.value;
                vars.edit_task.description = value;
                refs.edit_task.description.current.value = value;
              }}
            />
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="md" onClick={closeEditTaskModal}>Close</Button>
          <Button variant="primary" onClick={updateMyTask}>Save</Button>
        </Modal.Footer>
      </Modal>

      <Modal id="delete-task-modal"
        show={showDeleteTask}
        onHide={handleCloseDeleteTask}
      >
        <Modal.Header closeButton>
          <Modal.Title>Warning!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="md" onClick={closeDeleteTaskModal}>Cancel</Button>
          <Button variant="warning" onClick={deleteMyTask}>Yes, Delete it!</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
