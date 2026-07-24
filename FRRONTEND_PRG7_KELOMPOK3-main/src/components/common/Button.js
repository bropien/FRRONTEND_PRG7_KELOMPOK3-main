import PropTypes from "prop-types";
import Icon from "./Icon";

export default function Button({
  classType,
  iconName,
  label = "",
  title = "",
  type = "button",
  isDisabled = false,
  cssIcon = "",
  iconOnly = false,
  ...rest
}) {
  const buttonClass = iconOnly ? classType : `btn btn-${classType} rounded-3`;

  return (
    <button
      type={type}
      className={buttonClass}
      title={title}
      disabled={isDisabled}
      {...rest}
    >
      {iconName && (
        <Icon name={iconName} cssClass={label ? `pe-2 ${cssIcon}` : cssIcon} />
      )}
      {label}
    </button>
  );
}

Button.propTypes = {
  classType: PropTypes.string,
  iconName: PropTypes.string,
  label: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  isDisabled: PropTypes.bool,
  cssIcon: PropTypes.string,
  iconOnly: PropTypes.bool,
};
