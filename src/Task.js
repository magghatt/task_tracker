import { render } from 'react-dom';
import React, { useState, useEffect } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { createTask, updateTask, deleteTask } from './graphql/mutations';
import { listTasks } from './graphql/queries';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

function Task() {
  useEffect(() => {
  }, []);
}
async function getAllTasks() {
  try {
    const result = await API.graphql(graphqlOperation(listTasks));
    if(result.data) {
      console.log('tasksZ:'+ result.data.listTasks.items.length)
      let tasks = result.data.listTasks.items;
      let rows = [];
      for(let i=0; i<tasks.length; i++) {
        rows.push(
          <div>
            <td>[e] [d]</td>
            <td>tasks[i].status</td>
            <td>tasks[i].title</td>
            <td>tasks[i].description</td>
            <td>tasks[i].due_date</td>
          </div>
        );
      }
      //debugger
      return rows;
    }
  } catch(e){}
}

function Tasks() {
  function renderTasks() {
    let tasks = getAllTasks();
    console.log('tasksQ:'+ tasks.length)
    let rows = [];
    for(let i=0; i<tasks.length; i++) {
      rows.push(
        <div>
          <td>[e] [d]</td>
          <td>tasks[i].status</td>
          <td>tasks[i].title</td>
          <td>tasks[i].description</td>
          <td>tasks[i].due_date</td>
        </div>
      );
    }
    //debugger
    return rows;
  }
/*    <table>
    <thead>
      <tr>
        <th></th>
        <th>Status</th>
        <th>Title</th>
        <th>Description</th>
        <th>Due Date</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
    </table>
*/
  return (
    <div>
      getAllTasks()
    </div>
  );
}

export default Tasks;
