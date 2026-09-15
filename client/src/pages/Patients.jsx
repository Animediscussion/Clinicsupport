import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Paper,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Modal,
  Stack,
  SimpleGrid,
  Select,
  Textarea,
  NumberInput,
} from "@mantine/core";

import { IconPlus, IconSearch, IconEdit, IconTrash } from "@tabler/icons-react";

import { useEffect, useState } from "react";

import api from "../services/api";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [opened, setOpened] = useState(false);

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    bloodGroup: "Unknown",

    phone: "",
    email: "",
    address: "",

    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",

    allergies: "",
    medicalHistory: "",
  });

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");

      setPatients(response.data);
    } catch (error) {
      console.error("Patient fetch error:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      dateOfBirth: "",
      age: "",
      gender: "",
      bloodGroup: "Unknown",

      phone: "",
      email: "",
      address: "",

      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",

      allergies: "",
      medicalHistory: "",
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("Patient name is required");
      return;
    }

    if (!form.gender) {
      alert("Gender is required");
      return;
    }

    if (!form.phone.trim()) {
      alert("Phone number is required");
      return;
    }

    try {
      const patientData = {
        name: form.name,
        dateOfBirth: form.dateOfBirth || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        bloodGroup: form.bloodGroup,

        phone: form.phone,
        email: form.email,
        address: form.address,

        emergencyContact: {
          name: form.emergencyName,
          relationship: form.emergencyRelationship,
          phone: form.emergencyPhone,
        },

        allergies: form.allergies,
        medicalHistory: form.medicalHistory,
      };

      await api.post("/patients", patientData);

      setOpened(false);
      resetForm();

      await fetchPatients();
    } catch (error) {
      console.error("Create patient error:", error);

      alert(error.response?.data?.message || "Failed to create patient");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const searchText = search.toLowerCase();

    return (
      patient.name?.toLowerCase().includes(searchText) ||
      patient.patientId?.toLowerCase().includes(searchText) ||
      patient.phone?.toLowerCase().includes(searchText)
    );
  });

  return (
    <Container size="xl">
      {/* Header */}

      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Patients</Title>

          <Text c="dimmed">Manage clinic patients</Text>
        </div>

        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => {
            resetForm();
            setOpened(true);
          }}
        >
          Add Patient
        </Button>
      </Group>

      {/* Search */}

      <Paper withBorder p="md" mb="md">
        <TextInput
          placeholder="Search by name, patient ID or phone..."
          leftSection={<IconSearch size={18} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </Paper>

      {/* Patient Table */}

      <Paper withBorder radius="md" p="md">
        <Table.ScrollContainer minWidth={1000}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient ID</Table.Th>

                <Table.Th>Patient</Table.Th>

                <Table.Th>Gender</Table.Th>

                <Table.Th>Age</Table.Th>

                <Table.Th>Blood Group</Table.Th>

                <Table.Th>Phone</Table.Th>

                <Table.Th>Status</Table.Th>

                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredPatients.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text ta="center" c="dimmed" py="xl">
                      No patients found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredPatients.map((patient) => (
                  <Table.Tr key={patient._id}>
                    <Table.Td>
                      <Text fw={600}>{patient.patientId}</Text>
                    </Table.Td>

                    <Table.Td>
                      <Text fw={500}>{patient.name}</Text>

                      <Text size="xs" c="dimmed">
                        {patient.email || "No email"}
                      </Text>
                    </Table.Td>

                    <Table.Td>{patient.gender}</Table.Td>

                    <Table.Td>{patient.age ?? "-"}</Table.Td>

                    <Table.Td>
                      <Badge variant="light">{patient.bloodGroup}</Badge>
                    </Table.Td>

                    <Table.Td>{patient.phone}</Table.Td>

                    <Table.Td>
                      <Badge color="green">{patient.status}</Badge>
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
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* Add Patient Modal */}

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title="Register New Patient"
        size="lg"
      >
        <Stack>
          {/* Personal Information */}

          <Title order={4}>Personal Information</Title>

          <SimpleGrid cols={2}>
            <TextInput
              label="Full Name"
              placeholder="Rahul Kumar"
              required
              value={form.name}
              onChange={(event) =>
                handleChange("name", event.currentTarget.value)
              }
            />

            <TextInput
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(event) =>
                handleChange("dateOfBirth", event.currentTarget.value)
              }
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <NumberInput
              label="Age"
              placeholder="28"
              min={0}
              max={150}
              value={form.age}
              onChange={(value) => handleChange("age", value)}
            />

            <Select
              label="Gender"
              placeholder="Select gender"
              required
              data={["Male", "Female", "Other"]}
              value={form.gender}
              onChange={(value) => handleChange("gender", value)}
            />
          </SimpleGrid>

          <Select
            label="Blood Group"
            data={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]}
            value={form.bloodGroup}
            onChange={(value) => handleChange("bloodGroup", value)}
          />

          {/* Contact Information */}

          <Title order={4} mt="md">
            Contact Information
          </Title>

          <SimpleGrid cols={2}>
            <TextInput
              label="Phone"
              placeholder="9876543210"
              required
              value={form.phone}
              onChange={(event) =>
                handleChange("phone", event.currentTarget.value)
              }
            />

            <TextInput
              label="Email"
              placeholder="patient@example.com"
              value={form.email}
              onChange={(event) =>
                handleChange("email", event.currentTarget.value)
              }
            />
          </SimpleGrid>

          <Textarea
            label="Address"
            placeholder="Patient address"
            minRows={2}
            value={form.address}
            onChange={(event) =>
              handleChange("address", event.currentTarget.value)
            }
          />

          {/* Emergency Contact */}

          <Title order={4} mt="md">
            Emergency Contact
          </Title>

          <SimpleGrid cols={2}>
            <TextInput
              label="Contact Name"
              placeholder="Priya Kumar"
              value={form.emergencyName}
              onChange={(event) =>
                handleChange("emergencyName", event.currentTarget.value)
              }
            />

            <TextInput
              label="Relationship"
              placeholder="Wife"
              value={form.emergencyRelationship}
              onChange={(event) =>
                handleChange("emergencyRelationship", event.currentTarget.value)
              }
            />
          </SimpleGrid>

          <TextInput
            label="Emergency Phone"
            placeholder="9876500000"
            value={form.emergencyPhone}
            onChange={(event) =>
              handleChange("emergencyPhone", event.currentTarget.value)
            }
          />

          {/* Medical Information */}

          <Title order={4} mt="md">
            Medical Information
          </Title>

          <Textarea
            label="Allergies"
            placeholder="Example: Penicillin"
            minRows={2}
            value={form.allergies}
            onChange={(event) =>
              handleChange("allergies", event.currentTarget.value)
            }
          />

          <Textarea
            label="Medical History"
            placeholder="Previous illnesses, surgeries, conditions..."
            minRows={3}
            value={form.medicalHistory}
            onChange={(event) =>
              handleChange("medicalHistory", event.currentTarget.value)
            }
          />

          {/* Buttons */}

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setOpened(false);
                resetForm();
              }}
            >
              Cancel
            </Button>

            <Button onClick={handleSubmit}>Register Patient</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default Patients;
