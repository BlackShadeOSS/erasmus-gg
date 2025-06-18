import React from "react";

const Footer = () => {
  return (
    <footer>
      <div className="flex bg-neutral-900/70 justify-center items-center h-52  text-neutral-300">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Vocaba. All rights not reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
