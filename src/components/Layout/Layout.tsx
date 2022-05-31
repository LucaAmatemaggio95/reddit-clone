import React from "react";
import Navbar from "../Navbar/Navbar";

type Props = {
  children: React.ReactNode;
};

const Layout: React.FC<Props> = (props: Props) => {
  return (
    <>
      <Navbar />
      <main>{props.children}</main>
    </>
  );
};
export default Layout;
