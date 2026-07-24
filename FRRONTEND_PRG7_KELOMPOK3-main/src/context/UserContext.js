"use client";

import { createContext, useContext, useMemo } from "react";
import PropTypes from "prop-types";

const UserContext = createContext({
  userData: null,
  ssoData: null,
});

export function UserProvider({ children, userData, ssoData }) {
  const contextValue = useMemo(
    () => ({ userData, ssoData }),
    [userData, ssoData],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser harus digunakan di dalam UserProvider");
  }
  return context;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
  userData: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  ssoData: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
