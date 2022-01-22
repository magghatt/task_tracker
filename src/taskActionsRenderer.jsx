import React, { useState } from 'react';

export default (props) => {
  const task_id = props.valueFormatted ? props.valueFormatted : props.value;
  const handleEditTask = props.handleEditTask;
  const handleDeleteTask = props.handleDeleteTask;

  const editButtonClicked = () => {
    console.log('task_id: '+ task_id)
    handleEditTask(task_id);
  };

  const deleteButtonClicked = () => {
    handleDeleteTask(task_id);
  };

  return (
    <span>
      <button onClick={() => editButtonClicked()} className="btn btn-secondary btn-sm">Edit</button>
      <button onClick={() => deleteButtonClicked()} className="btn btn-secondary btn-sm">Delete</button>
    </span>
  );
};
