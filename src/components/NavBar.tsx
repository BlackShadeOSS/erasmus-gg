import React from "react";
import Link from "next/link";
import Home from "@/app/(main-page)/page";

const NavBar = () => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/"></Link>
          </li>
          <li>
            <Link href="/"></Link>
          </li>
          <li>
            <Link href="/"></Link>
          </li>
          <li>
            <Link href="/"></Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
