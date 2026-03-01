"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import RegexIcon from "@mui/icons-material/DataObject";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

import { useAuth, useAuthDispatch } from "@/contexts/AuthContext";
import { useSearch, useSearchDispatch } from "@/contexts/SearchContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import api from "@/lib/api";
import { clearPreset } from "@/lib/cookies";
import LoginDialog from "@/components/user/LoginDialog";
import RegisterDialog from "@/components/user/RegisterDialog";
import UserAvatar from "@/components/user/UserAvatar";
import ThemeToggle from "@/components/ThemeToggle";
import MobileDrawer from "./MobileDrawer";
import Logo from "../Logo";
import { Collapse, Fab, Slide, Tab, Tabs, useScrollTrigger } from "@mui/material";
import React from "react";
import { ArrowUpward } from "@mui/icons-material";

const navLinks = [
  { label: "全部课程", href: "/" },
  { label: "最近评价", href: "/recent" },
  { label: "赏金排名", href: "/ranking" },
  { label: "关于我们", href: "/about" },
] as const;

function ElevationScroll(props: { children?: React.ReactElement<{ elevation?: number }>; }) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return children
    ? React.cloneElement(children, {
        elevation: trigger ? 4 : 0,
      })
    : null;
}

function BackToTop(props: { ref : React.Ref<React.ReactElement> }){
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  });

  return <Slide in={trigger} direction="up">
    <Fab
      variant="extended"
      size="small"
      color="primary"
      sx={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        translate: "-50%"
      }}
    >
      <ArrowUpward sx={{ mr: 0.2 }} />
      返回顶部
    </Fab>
  </Slide>
}

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();

  const { isLogin, userProfile } = useAuth();
  const authDispatch = useAuthDispatch();
  const { keys, isRegexp } = useSearch();
  const searchDispatch = useSearchDispatch();
  const showSnackbar = useSnackbar();
  const AppBarRef = useRef(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleUserMenuOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget),
    []
  );
  const handleUserMenuClose = useCallback(() => setAnchorEl(null), []);

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/v1/user/logout");
    } catch {
      // Ignore
    }
    authDispatch({ type: "LOGOUT" });
    clearPreset();
    handleUserMenuClose();
    showSnackbar("已退出登录", "success");
  }, [authDispatch, handleUserMenuClose, showSnackbar]);

  return (
    <>
      <ElevationScroll>
        <AppBar
          position="sticky"
          color="default"
          enableColorOnDark
          className="transition-all"
          ref={AppBarRef}
        >
          <Toolbar className="max-w-7xl w-full mx-auto">
            {/* Mobile menu button */}
            <Collapse in={isMobile} orientation="horizontal">
              <IconButton
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Collapse>

            {/* Logo */}
            <Link href="/" className="no-underline flex items-center mr-4">
              <Logo width={130}/>
            </Link>

            {/* Desktop nav links */}
            {!isMobile && (
              <Tabs
                value={
                  navLinks.some((link) => link.href === pathname)
                    ? pathname
                    : false
                }
                variant="scrollable"
                scrollButtons="auto"
                aria-label="navigation tabs"
              >
                {navLinks.map((link) => (
                <Tab
                  key={link.href}
                  label={link.label}
                  value={link.href}
                  component={Link}
                  href={link.href}
                />
                ))}
              </Tabs>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <Collapse in={!isMobile} orientation="horizontal">
              <Box sx={{ display: "flex", gap: 1, marginX: 1 }}>
                
                {/* Theme toggle */}
                <ThemeToggle />
              </Box>
            </Collapse>

            {/* Auth buttons / User menu */}
            {isLogin && userProfile ? (
              <>
                <IconButton onClick={handleUserMenuOpen} size="small">
                  <UserAvatar userProfile={userProfile} size={32} />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem
                    component={Link}
                    href={`/user/${userProfile.id}`}
                    onClick={handleUserMenuClose}
                  >
                    <PersonIcon sx={{ mr: 1 }} fontSize="small" />
                    个人主页
                  </MenuItem>
                  <MenuItem onClick={handleUserMenuClose}>
                    <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
                    设置
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                    退出登录
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setLoginOpen(true)}
                >
                  登录
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setRegisterOpen(true)}
                >
                  注册
                </Button>
              </Box>
            )}
          </Toolbar>
          
          <Collapse in={pathname === "/"}>
            <Box className="flex w-full max-w-7xl justify-center items-center mb-2">
              {/* Search bar (desktop only on home page) */}
              <TextField
                size="small"
                placeholder={isRegexp? "输入正则表达式" : "搜索课程，空格分隔关键词"}
                value={keys}
                onChange={(e) =>
                  searchDispatch({ type: "SET_KEYS", payload: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={isRegexp ? "正则表达式已开启" : "开启正则搜索"}>
                        <IconButton
                          size="small"
                          onClick={() => searchDispatch({ type: "TOGGLE_REGEXP" })}
                          color={isRegexp ? "primary" : "default"}
                        >
                          <RegexIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                sx={{ width: "50%" }}
              />
            </Box>
          </Collapse>
        </AppBar>
      </ElevationScroll>

      {/* <BackToTop ref={AppBarRef} /> */}

      {/* Dialogs */}
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={navLinks.map((l) => ({ ...l }))}
      />
    </>
  );
}
