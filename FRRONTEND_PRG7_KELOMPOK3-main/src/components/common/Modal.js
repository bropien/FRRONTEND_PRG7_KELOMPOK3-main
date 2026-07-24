"use client";

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  hideCloseButton = false,
  footer,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    const handleBackdropClick = (e) => {
      if (dialogRef.current && e.target === dialogRef.current) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      if (dialogRef.current) {
        dialogRef.current.addEventListener("mousedown", handleBackdropClick);
      }
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (dialogRef.current) {
        dialogRef.current.removeEventListener("mousedown", handleBackdropClick);
      }
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass =
    {
      sm: "modal-sm",
      md: "",
      lg: "modal-lg",
      xl: "modal-xl",
    }[size] || "";

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>

      <dialog
        ref={dialogRef}
        className="modal fade show d-block"
        aria-modal="true"
        style={{
          zIndex: 1055,
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizeClass}`}
        >
          <div className="modal-content shadow-lg rounded-4 border-0">
            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
              {title && (
                <h5 className="modal-title fw-bold text-primary">{title}</h5>
              )}
              {!hideCloseButton && (
                <button
                  type="button"
                  className="btn-close shadow-none"
                  aria-label="Tutup"
                  onClick={onClose}
                ></button>
              )}
            </div>

            <div className="modal-body p-4">{children}</div>

            {footer && (
              <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
                {footer}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  hideCloseButton: PropTypes.bool,
  footer: PropTypes.node,
};
