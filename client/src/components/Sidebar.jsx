import {
  IconDashboard,
  IconUsers,
  IconStethoscope,
  IconCalendar,
  IconFileInvoice,
  IconLogout,
} from "@tabler/icons-react";

import { NavLink, useNavigate } from "react-router-dom";

import { Stack, Text, Button, Divider } from "@mantine/core";

const links = [
  {
    label: "Dashboard",
    path: "/",
    icon: IconDashboard,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: IconUsers,
  },
  {
    label: "Doctors",
    path: "/doctors",
    icon: IconStethoscope,
  },
  {
    label: "Appointments",
    path: "/appointments",
    icon: IconCalendar,
  },
  {
    label: "Billing",
    path: "/billing",
    icon: IconFileInvoice,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Stack p="md" h="100vh" w={250} bg="blue.7" gap="sm">
      <Text c="white" fw={700} size="xl" mb="md">
        Hospital HMS
      </Text>

      {links.map((link) => {
        const Icon = link.icon;

        return (
          <Button
            key={link.path}
            component={NavLink}
            to={link.path}
            variant="subtle"
            color="white"
            justify="flex-start"
            leftSection={<Icon size={20} />}
          >
            {link.label}
          </Button>
        );
      })}

      <Divider color="blue.5" mt="auto" />

      <Button
        variant="light"
        color="red"
        leftSection={<IconLogout size={20} />}
        onClick={logout}
      >
        Logout
      </Button>
    </Stack>
  );
}

export default Sidebar;
