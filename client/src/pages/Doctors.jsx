import {
  Container,
  Title,
  Button,
  Group,
  Paper,
  Table,
  Badge,
  ActionIcon,
  Text,
} from "@mantine/core";

import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";

import { useEffect, useState } from "react";

import api from "../services/api";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const response = await api.get("/doctors");

      setDoctors(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Doctors</Title>

          <Text c="dimmed">Manage clinic doctors</Text>
        </div>

        <Button leftSection={<IconPlus size={18} />}>Add Doctor</Button>
      </Group>

      <Paper withBorder radius="md" p="md">
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Doctor</Table.Th>

                <Table.Th>Specialization</Table.Th>

                <Table.Th>Phone</Table.Th>

                <Table.Th>Experience</Table.Th>

                <Table.Th>Fee</Table.Th>

                <Table.Th>Status</Table.Th>

                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {doctors.map((doctor) => (
                <Table.Tr key={doctor._id}>
                  <Table.Td>
                    <Text fw={500}>{doctor.name}</Text>

                    <Text size="xs" c="dimmed">
                      {doctor.email}
                    </Text>
                  </Table.Td>

                  <Table.Td>{doctor.specialization}</Table.Td>

                  <Table.Td>{doctor.phone}</Table.Td>

                  <Table.Td>{doctor.experience} years</Table.Td>

                  <Table.Td>₹{doctor.consultationFee}</Table.Td>

                  <Table.Td>
                    <Badge
                      color={doctor.status === "active" ? "green" : "gray"}
                    >
                      {doctor.status}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light">
                        <IconEdit size={17} />
                      </ActionIcon>

                      <ActionIcon color="red" variant="light">
                        <IconTrash size={17} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </Container>
  );
}

export default Doctors;
