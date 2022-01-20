import React, { useState } from 'react';

export default (props) => {
  const cellValue = props.valueFormatted ? props.valueFormatted : props.value;

  const editButtonClicked = () => {
    alert(`edit: ${cellValue}`);
    //$('#openEditTaskModal').click();

  };

  const deleteButtonClicked = () => {
    // need to use Confirm?
    alert(`delete: ${cellValue}`);
  };

  return (
    <span>
      <button onClick={() => editButtonClicked()} className="btn btn-secondary btn-sm">Edit</button>
      <button onClick={() => deleteButtonClicked()} className="btn btn-secondary btn-sm">Delete</button>
    </span>
  );
};
