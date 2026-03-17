"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Logo from "../Logo";

interface NavLink {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function MobileDrawer({
  open,
  onClose,
  children,
}: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 260, pt: 2 }}>
        <Logo width={120} sx={{ mx: 2 }} />
        <Divider />
        {children}
      </Box>
    </Drawer>
  );
}
