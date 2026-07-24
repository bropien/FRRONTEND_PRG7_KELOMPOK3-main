import PropTypes from "prop-types";
import Icon from "./Icon";

export default function Label({
  text,
  htmlFor,
  required = false,
  tooltip = "",
  className = "",
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`form-label fw-bold text-primary small mb-2 ${className}`}
    >
      {text}
      {required && <span className="text-danger ms-1">*</span>}
      {tooltip && (
        <Icon
          name="question-circle-fill"
          cssClass="text-secondary ms-2"
          title={tooltip}
          style={{ cursor: "help", fontSize: "1em" }}
        />
      )}
    </label>
  );
}

Label.propTypes = {
  text: PropTypes.string.isRequired,
  htmlFor: PropTypes.string,
  required: PropTypes.bool,
  tooltip: PropTypes.string,
  className: PropTypes.string,
};
