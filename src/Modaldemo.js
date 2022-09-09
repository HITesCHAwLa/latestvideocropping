import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function Modaldemo({
  children,
  clickhandle,
  check,
  show,
  setShow,
  setcheck,
  ERRmessage,
  setErrormessage,
  seturldata,
  setCrop,
  errordata,
  setErrordata,
}) {
  const handleClose = (e) => {
    setcheck(false);
    setShow(false);
    seturldata("");
    setCrop({
      height: 338,
      unit: "px",
      width: 640,
      x: 0,
      y: 0,
    });
    setErrordata({ title: "", body: "" });
  };
  const handleShow = () => setShow(true);

  return (
    <>
      <Modal
        className="video-modal"
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={show}
        onHide={handleClose}
        animation={false}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {errordata.title !== ""
              ? errordata.title
              : "Trim and Crop Your Video"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="close-btn"
            onClick={handleClose}
          >
            Close
          </Button>
          {errordata.title === "" && (
            <Button
              variant="primary"
              className="crop-btn"
              onClick={(e) => clickhandle(e)}
            >
              Crop video
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Modaldemo;
