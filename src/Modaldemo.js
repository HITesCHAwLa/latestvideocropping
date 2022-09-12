import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FaRegPlayCircle } from "react-icons/fa";
import { HiOutlinePause } from "react-icons/hi";
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
  videoref,
  timingscheck,
  setisPlaying,
  isPlaying,
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

  const playvideo = () => {
    videoref.current.seekTo(timingscheck[0].start);

    setisPlaying(true);
  };

  function pausevideo() {
    setisPlaying(false);
  }

  return (
    <>
      <Modal
        className="video-modal"
        size="xl"
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
          {/* <Button
            variant="secondary"
            className="close-btn"
            onClick={handleClose}
          > */}
          {errordata.title === "" && (
            <div className="play-button">
              {isPlaying ? (
                <HiOutlinePause onClick={pausevideo} />
              ) : (
                <FaRegPlayCircle onClick={playvideo} />
              )}
            </div>
          )}

          {/* </Button> */}
          {errordata.title === "" && (
            <Button
              variant="primary"
              className="crop-btn"
              onClick={(e) => clickhandle(e)}
            >
              Save
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Modaldemo;
