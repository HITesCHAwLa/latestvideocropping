import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Modaldemo({children,clickhandle,check,show,setShow,setcheck}) {


  const handleClose = (e) => {
    setcheck(false)
    setShow(false)
}
  const handleShow = () => setShow(true);

  return (
    <>
     
      <Modal className='video-modal'  size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Trim and Crop Your Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {children}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className='close-btn' onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" className='crop-btn' onClick={(e)=> clickhandle(e)}>
            Crop video
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Modaldemo