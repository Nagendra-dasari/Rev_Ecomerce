import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

function Modal({ isOpen, title, children, onClose }) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={Boolean(isOpen)}>
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
}

export default Modal;
