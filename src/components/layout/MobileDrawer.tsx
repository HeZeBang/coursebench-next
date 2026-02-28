"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

interface NavLink {
  label: string;
  href: string;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
}

export default function MobileDrawer({
  open,
  onClose,
  navLinks,
}: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 260, pt: 2 }}>
        <Typography
          variant="h6"
          sx={{ px: 2, pb: 1, fontWeight: 700, color: "primary.main" }}
        >
          CourseBench
        </Typography>
        <Divider />
        <List>
          {navLinks.map((link) => (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                component={Link}
                href={link.href}
                selected={pathname === link.href}
                onClick={onClose}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
