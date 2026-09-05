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
  Modal,
  TextInput,
  NumberInput,
  Select,
  MultiSelect,
  Stack,
  SimpleGrid,
} from "@mantine/core";

import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";

import { useEffect, useState } from "react";

import api from "../services/api";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [opened, setOpened] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: 0,
    consultationFee: 0,
    days: [],
    startTime: "",
    endTime: "",
  });

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

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.post("/doctors", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        specialization: form.specialization,
        qualification: form.qualification,
        experience: form.experience,
        consultationFee: form.consultationFee,

        availability: {
          days: form.days,
          startTime: form.startTime,
          endTime: form.endTime,
        },
      });

      setOpened(false);

      setForm({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        qualification: "",
        experience: 0,
        consultationFee: 0,
        days: [],
        startTime: "",
        endTime: "",
      });

      fetchDoctors();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container size="xl">
      {/* Header */}

      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Doctors</Title>

          <Text c="dimmed">Manage clinic doctors</Text>
        </div>

        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => setOpened(true)}
        >
          Add Doctor
        </Button>
      </Group>

      {/* Doctor Table */}

      <Paper withBorder radius="md" p="md">
        <Table.ScrollContainer minWidth={900}>
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

      {/* Add Doctor Modal */}

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Add New Doctor"
        size="lg"
      >
        <Stack>
          <SimpleGrid cols={2}>
            <TextInput
              label="Doctor Name"
              placeholder="Dr. John Smith"
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.currentTarget.value)}
            />

            <TextInput
              label="Email"
              placeholder="doctor@example.com"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.currentTarget.value)}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput
              label="Phone"
              placeholder="9876543210"
              required
              value={form.phone}
              onChange={(e) => handleChange("phone", e.currentTarget.value)}
            />

            <Select
              label="Specialization"
              placeholder="Select specialization"
              required
              data={[
                "General Physician",
                "Cardiologist",
                "Dermatologist",
                "Neurologist",
                "Orthopedic",
                "Pediatrician",
                "Gynecologist",
                "ENT Specialist",
                "Dentist",
              ]}
              value={form.specialization}
              onChange={(value) => handleChange("specialization", value)}
            />
          </SimpleGrid>

          <TextInput
            label="Qualification"
            placeholder="MBBS, MD"
            required
            value={form.qualification}
            onChange={(e) =>
              handleChange("qualification", e.currentTarget.value)
            }
          />

          <SimpleGrid cols={2}>
            <NumberInput
              label="Experience"
              suffix=" years"
              min={0}
              value={form.experience}
              onChange={(value) => handleChange("experience", value)}
            />

            <NumberInput
              label="Consultation Fee"
              prefix="₹ "
              min={0}
              value={form.consultationFee}
              onChange={(value) => handleChange("consultationFee", value)}
            />
          </SimpleGrid>

          <MultiSelect
            label="Available Days"
            placeholder="Select days"
            data={[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ]}
            value={form.days}
            onChange={(value) => handleChange("days", value)}
          />

          <SimpleGrid cols={2}>
            <TimeInput
              label="Start Time"
              value={form.startTime}
              onChange={(e) => handleChange("startTime", e.currentTarget.value)}
            />

            <TimeInput
              label="End Time"
              value={form.endTime}
              onChange={(e) => handleChange("endTime", e.currentTarget.value)}
            />
          </SimpleGrid>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>

            <Button onClick={handleSubmit}>Add Doctor</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default Doctors;
