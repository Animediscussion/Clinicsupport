import { Group, Text } from "@mantine/core";

function Navbar() {
  return (
    <Group
      justify="space-between"
      p="md"
      style={{
        borderBottom: "1px solid #e9ecef",
      }}
    >
      <Text fw={600} size="lg">
        Hospital Management System
      </Text>

      <Text c="dimmed">Administrator</Text>
    </Group>
  );
}

export default Navbar;
