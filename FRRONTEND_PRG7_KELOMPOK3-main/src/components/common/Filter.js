"use client";

import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "./Button";

export default function Filter({ children, onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <Button
        iconName="funnel"
        classType={`primary dropdown-toggle border-start ${isOpen ? "show" : ""}`}
        title="Saring atau Urutkan Data"
        onClick={() => setIsOpen(!isOpen)}
      />

      <div
        className={`dropdown-menu p-4 rounded-4 shadow ${isOpen ? "show" : ""}`}
        style={{ width: "350px", right: 0, left: "auto" }}
      >
        {children}
        <div className="d-flex justify-content-end mt-3">
          <Button
            classType="primary"
            iconName="save"
            title="Terapkan"
            label="Terapkan"
            onClick={() => {
              if (onClick) onClick();
              setIsOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

Filter.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
};
