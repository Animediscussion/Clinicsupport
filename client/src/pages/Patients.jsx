import { useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Title,
} from "@mantine/core";

import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconAlertCircle,
} from "@tabler/icons-react";

import api from "../services/api";

const initialForm = {
  name: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  bloodGroup: "",
  phone: "",
  email: "",
  address: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  allergies: "",
  medicalHistory: "",
};

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [opened, setOpened] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [viewOpened, setViewOpened] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [deleteOpened, setDeleteOpened] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------
  // Fetch patients
  // --------------------------------
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients");

      setPatients(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --------------------------------
  // Form change
  // --------------------------------
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --------------------------------
  // Reset form
  // --------------------------------
  const resetForm = () => {
    setForm(initialForm);
    setEditingPatient(null);
    setError("");
  };

  // --------------------------------
  // Open Add Patient
  // --------------------------------
  const handleAdd = () => {
    resetForm();
    setOpened(true);
  };

  // --------------------------------
  // Open Edit Patient
  // --------------------------------
  const handleEdit = (patient) => {
    setEditingPatient(patient);

    setForm({
      name: patient.name || "",
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",

      emergencyName: patient.emergencyContact?.name || "",

      emergencyRelationship: patient.emergencyContact?.relationship || "",

      emergencyPhone: patient.emergencyContact?.phone || "",

      allergies: patient.allergies || "",
      medicalHistory: patient.medicalHistory || "",
    });

    setError("");
    setOpened(true);
  };

  // --------------------------------
  // Validation
  // --------------------------------
  const validateForm = () => {
    if (!form.name.trim()) {
      return "Patient name is required.";
    }

    if (!form.phone.trim()) {
      return "Phone number is required.";
    }

    if (!form.gender) {
      return "Please select gender.";
    }

    if (!form.bloodGroup) {
      return "Please select blood group.";
    }

    if (form.email && !form.email.includes("@")) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  // --------------------------------
  // Add / Update Patient
  // --------------------------------
  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const patientData = {
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
      age: form.age === "" || form.age === null ? undefined : Number(form.age),

      gender: form.gender,
      bloodGroup: form.bloodGroup,

      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),

      emergencyContact: {
        name: form.emergencyName.trim(),
        relationship: form.emergencyRelationship.trim(),
        phone: form.emergencyPhone.trim(),
      },

      allergies: form.allergies.trim(),
      medicalHistory: form.medicalHistory.trim(),
    };

    try {
      setLoading(true);
      setError("");

      if (editingPatient) {
        await api.put(`/patients/${editingPatient._id}`, patientData);
      } else {
        await api.post("/patients", patientData);
      }

      setOpened(false);
      resetForm();

      await fetchPatients();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to save patient.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // View Patient
  // --------------------------------
  const handleView = async (patient) => {
    try {
      setLoading(true);

      const response = await api.get(`/patients/${patient._id}`);

      setSelectedPatient(response.data);
      setViewOpened(true);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Unable to load patient details.",
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Open delete confirmation
  // --------------------------------
  const handleDeleteClick = (id) => {
    setDeletePatientId(id);
    setDeleteOpened(true);
  };

  // --------------------------------
  // Deactivate patient
  // --------------------------------
  const handleDelete = async () => {
    if (!deletePatientId) return;

    try {
      setLoading(true);

      await api.delete(`/patients/${deletePatientId}`);

      setDeleteOpened(false);
      setDeletePatientId(null);

      await fetchPatients();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to deactivate patient.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Search
  // --------------------------------
  const filteredPatients = patients.filter((patient) => {
    const value = search.toLowerCase();

    return (
      patient.name?.toLowerCase().includes(value) ||
      patient.patientId?.toLowerCase().includes(value) ||
      patient.phone?.toLowerCase().includes(value)
    );
  });

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Patients</Title>

          <Text c="dimmed" size="sm">
            Manage patient records and medical information
          </Text>
        </div>

        <Button leftSection={<IconPlus size={18} />} onClick={handleAdd}>
          Add Patient
        </Button>
      </Group>

      {/* Error */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={18} />}
          color="red"
          withCloseButton
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Search */}
      <Paper withBorder p="md">
        <TextInput
          placeholder="Search by name, patient ID or phone..."
          leftSection={<IconSearch size={18} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      </Paper>

      {/* Patient table */}
      <Paper withBorder>
        <ScrollArea>
          <Table striped highlightOnHover verticalSpacing="md" miw={900}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Patient ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Age</Table.Th>
                <Table.Th>Gender</Table.Th>
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
                      {loading ? "Loading patients..." : "No patients found."}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredPatients.map((patient) => (
                  <Table.Tr key={patient._id}>
                    <Table.Td>
                      <Text fw={600}>{patient.patientId}</Text>
                    </Table.Td>

                    <Table.Td>{patient.name}</Table.Td>

                    <Table.Td>{patient.age ?? "-"}</Table.Td>

                    <Table.Td>{patient.gender}</Table.Td>

                    <Table.Td>{patient.bloodGroup}</Table.Td>

                    <Table.Td>{patient.phone}</Table.Td>

                    <Table.Td>
                      <Badge color="green">Active</Badge>
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleView(patient)}
                          title="View patient"
                        >
                          <IconEye size={17} />
                        </ActionIcon>

                        <ActionIcon
                          variant="light"
                          color="yellow"
                          onClick={() => handleEdit(patient)}
                          title="Edit patient"
                        >
                          <IconEdit size={17} />
                        </ActionIcon>

                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDeleteClick(patient._id)}
                          title="Deactivate patient"
                        >
                          <IconTrash size={17} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* =========================================
          ADD / EDIT PATIENT MODAL
      ========================================= */}
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title={
          <Text fw={700} size="lg">
            {editingPatient ? "Edit Patient" : "Add New Patient"}
          </Text>
        }
        size="xl"
      >
        <Stack>
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              {error}
            </Alert>
          )}

          <Text fw={600}>Basic Information</Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="Full Name"
              placeholder="Enter patient name"
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.currentTarget.value)}
            />

            <TextInput
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) =>
                handleChange("dateOfBirth", e.currentTarget.value)
              }
            />

            <NumberInput
              label="Age"
              placeholder="Age"
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
              onChange={(value) => handleChange("gender", value || "")}
            />

            <Select
              label="Blood Group"
              placeholder="Select blood group"
              required
              data={[
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
                "Unknown",
              ]}
              value={form.bloodGroup}
              onChange={(value) => handleChange("bloodGroup", value || "")}
            />

            <TextInput
              label="Phone"
              placeholder="Phone number"
              required
              value={form.phone}
              onChange={(e) => handleChange("phone", e.currentTarget.value)}
            />

            <TextInput
              label="Email"
              placeholder="patient@example.com"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.currentTarget.value)}
            />
          </SimpleGrid>

          <Textarea
            label="Address"
            placeholder="Patient address"
            minRows={2}
            value={form.address}
            onChange={(e) => handleChange("address", e.currentTarget.value)}
          />

          <Text fw={600} mt="md">
            Emergency Contact
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <TextInput
              label="Name"
              placeholder="Emergency contact name"
              value={form.emergencyName}
              onChange={(e) =>
                handleChange("emergencyName", e.currentTarget.value)
              }
            />

            <TextInput
              label="Relationship"
              placeholder="Father, Mother, Spouse..."
              value={form.emergencyRelationship}
              onChange={(e) =>
                handleChange("emergencyRelationship", e.currentTarget.value)
              }
            />

            <TextInput
              label="Phone"
              placeholder="Emergency phone"
              value={form.emergencyPhone}
              onChange={(e) =>
                handleChange("emergencyPhone", e.currentTarget.value)
              }
            />
          </SimpleGrid>

          <Text fw={600} mt="md">
            Medical Information
          </Text>

          <Textarea
            label="Allergies"
            placeholder="Known allergies"
            minRows={3}
            value={form.allergies}
            onChange={(e) => handleChange("allergies", e.currentTarget.value)}
          />

          <Textarea
            label="Medical History"
            placeholder="Previous illnesses, surgeries, conditions..."
            minRows={4}
            value={form.medicalHistory}
            onChange={(e) =>
              handleChange("medicalHistory", e.currentTarget.value)
            }
          />

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

            <Button loading={loading} onClick={handleSubmit}>
              {editingPatient ? "Update Patient" : "Add Patient"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* =========================================
          VIEW PATIENT MODAL
      ========================================= */}
      <Modal
        opened={viewOpened}
        onClose={() => {
          setViewOpened(false);
          setSelectedPatient(null);
        }}
        title="Patient Details"
        size="xl"
      >
        {selectedPatient && (
          <Stack>
            <Group justify="space-between">
              <div>
                <Text size="xl" fw={700}>
                  {selectedPatient.name}
                </Text>

                <Text c="dimmed">{selectedPatient.patientId}</Text>
              </div>

              <Badge color="green" size="lg">
                {selectedPatient.status}
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Paper withBorder p="md">
                <Text size="sm" c="dimmed">
                  Age
                </Text>
                <Text fw={600}>{selectedPatient.age ?? "-"}</Text>
              </Paper>

              <Paper withBorder p="md">
                <Text size="sm" c="dimmed">
                  Gender
                </Text>
                <Text fw={600}>{selectedPatient.gender}</Text>
              </Paper>

              <Paper withBorder p="md">
                <Text size="sm" c="dimmed">
                  Blood Group
                </Text>
                <Text fw={600}>{selectedPatient.bloodGroup}</Text>
              </Paper>

              <Paper withBorder p="md">
                <Text size="sm" c="dimmed">
                  Phone
                </Text>
                <Text fw={600}>{selectedPatient.phone}</Text>
              </Paper>

              <Paper withBorder p="md">
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Text fw={600}>{selectedPatient.email || "-"}</Text>
              </Paper>

              <Paper withBorder p="md">
                <Text size="sm" c="dimmed">
                  Date of Birth
                </Text>
                <Text fw={600}>
                  {selectedPatient.dateOfBirth
                    ? selectedPatient.dateOfBirth.slice(0, 10)
                    : "-"}
                </Text>
              </Paper>
            </SimpleGrid>

            <Paper withBorder p="md">
              <Text fw={600} mb="xs">
                Address
              </Text>

              <Text>{selectedPatient.address || "-"}</Text>
            </Paper>

            <Paper withBorder p="md">
              <Text fw={600} mb="xs">
                Emergency Contact
              </Text>

              <Text>Name: {selectedPatient.emergencyContact?.name || "-"}</Text>

              <Text>
                Relationship:{" "}
                {selectedPatient.emergencyContact?.relationship || "-"}
              </Text>

              <Text>
                Phone: {selectedPatient.emergencyContact?.phone || "-"}
              </Text>
            </Paper>

            <Paper withBorder p="md">
              <Text fw={600} mb="xs">
                Allergies
              </Text>

              <Text>{selectedPatient.allergies || "None recorded"}</Text>
            </Paper>

            <Paper withBorder p="md">
              <Text fw={600} mb="xs">
                Medical History
              </Text>

              <Text>
                {selectedPatient.medicalHistory ||
                  "No medical history recorded"}
              </Text>
            </Paper>
          </Stack>
        )}
      </Modal>

      {/* =========================================
          DEACTIVATE CONFIRMATION
      ========================================= */}
      <Modal
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        title="Deactivate Patient"
        centered
      >
        <Stack>
          <Text>Are you sure you want to deactivate this patient?</Text>

          <Text size="sm" c="dimmed">
            The patient will no longer appear in the active patient list, but
            their historical medical records will remain in the database.
          </Text>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteOpened(false)}>
              Cancel
            </Button>

            <Button color="red" loading={loading} onClick={handleDelete}>
              Deactivate
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default Patients;
