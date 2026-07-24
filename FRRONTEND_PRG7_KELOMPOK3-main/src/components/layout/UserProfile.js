import PropTypes from "prop-types";

export default function UserProfile({ name, role }) {
  const displayName = name;
  const displayRole = role;

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div className="d-flex align-items-center">
      <div
        data-tooltip-id="menu-tooltip"
        data-tooltip-content={displayName}
        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
        style={{ width: 40, height: 40 }}
      >
        {initials}
      </div>
      <div className="d-none d-sm-block ms-3" style={{ lineHeight: "1.3" }}>
        <div className="fw-semibold">{displayName}</div>{" "}
        <small className="text-secondary">{displayRole}</small>{" "}
      </div>
    </div>
  );
}

UserProfile.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};
