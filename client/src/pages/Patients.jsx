import { useEffect, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";

import {
  IconAlertCircle,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PatientForm from "../components/PatientForm";

import api from "../services/api";

function Patients() {
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  // --------------------------------------------------
  // Fetch patients
  // --------------------------------------------------

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients");

      setPatients(response.data);
    } catch (error) {
      console.error("Failed to fetch patients:", error);

      setError(error.response?.data?.message || "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getGenderColor = (gender) => {
    switch (gender) {
      case "Male":
        return "blue";

      case "Female":
        return "pink";

      case "Other":
        return "grape";

      default:
        return "gray";
    }
  };

  // --------------------------------------------------
  // Filter patients
  // --------------------------------------------------

  const filteredPatients = patients.filter((patient) => {
    const searchValue = search.toLowerCase();

    const name = patient.name?.toLowerCase() || "";

    const email = patient.email?.toLowerCase() || "";

    const phone = patient.phone?.toLowerCase() || "";

    const matchesSearch =
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      phone.includes(searchValue);

    const matchesGender =
      genderFilter === "all" || patient.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  // --------------------------------------------------
  // Table rows
  // --------------------------------------------------

  const rows = filteredPatients.map((patient) => (
    <Table.Tr key={patient._id}>
      <Table.Td>
        <Group gap="sm">
          <IconUser size={20} color="var(--mantine-color-blue-6)" />

          <div>
            <Text fw={600}>{patient.name}</Text>

            <Text size="xs" c="dimmed">
              {patient.email || "-"}
            </Text>
          </div>
        </Group>
      </Table.Td>

      <Table.Td>{patient.age || "-"}</Table.Td>

      <Table.Td>
        <Badge variant="light" color={getGenderColor(patient.gender)}>
          {patient.gender || "Not specified"}
        </Badge>
      </Table.Td>

      <Table.Td>{patient.bloodGroup || "-"}</Table.Td>

      <Table.Td>{patient.phone || "-"}</Table.Td>

      <Table.Td>{formatDate(patient.createdAt)}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <main style={{ flex: 1 }}>
        <Navbar />

        <div style={{ padding: "24px" }}>
          {/* Header */}

          <Group justify="space-between" mb="xl">
            <div>
              <Title order={2}>Patients</Title>

              <Text c="dimmed" size="sm">
                Manage patient records
              </Text>
            </div>

            <Group>
              <Button
                variant="light"
                leftSection={<IconRefresh size={18} />}
                onClick={fetchPatients}
              >
                Refresh
              </Button>

              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setShowForm(true)}
              >
                Add Patient
              </Button>
            </Group>
          </Group>

          {/* Error */}

          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />} mb="md">
              {error}
            </Alert>
          )}

          {/* Statistics */}

          <SimpleGrid
            cols={{
              base: 1,
              sm: 2,
              lg: 3,
            }}
            mb="xl"
          >
            <Card withBorder shadow="sm">
              <Group>
                <IconUsers size={32} color="var(--mantine-color-blue-6)" />

                <div>
                  <Text size="sm" c="dimmed">
                    Total Patients
                  </Text>

                  <Text fw={700} size="xl">
                    {patients.length}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder shadow="sm">
              <Group>
                <IconUser size={32} color="var(--mantine-color-cyan-6)" />

                <div>
                  <Text size="sm" c="dimmed">
                    Male Patients
                  </Text>

                  <Text fw={700} size="xl">
                    {
                      patients.filter((patient) => patient.gender === "Male")
                        .length
                    }
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder shadow="sm">
              <Group>
                <IconUser size={32} color="var(--mantine-color-pink-6)" />

                <div>
                  <Text size="sm" c="dimmed">
                    Female Patients
                  </Text>

                  <Text fw={700} size="xl">
                    {
                      patients.filter((patient) => patient.gender === "Female")
                        .length
                    }
                  </Text>
                </div>
              </Group>
            </Card>
          </SimpleGrid>

          {/* Patient List */}

          <Card withBorder shadow="sm" radius="md">
            <Group justify="space-between" mb="md">
              <Title order={4}>Patient List</Title>

              <Group>
                <TextInput
                  placeholder="Search patients..."
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />

                <Select
                  placeholder="Gender"
                  value={genderFilter}
                  onChange={(value) => setGenderFilter(value || "all")}
                  data={[
                    {
                      value: "all",
                      label: "All",
                    },
                    {
                      value: "Male",
                      label: "Male",
                    },
                    {
                      value: "Female",
                      label: "Female",
                    },
                    {
                      value: "Other",
                      label: "Other",
                    },
                  ]}
                  w={140}
                />
              </Group>
            </Group>

            {loading ? (
              <Stack align="center" justify="center" p="xl">
                <Loader />

                <Text c="dimmed">Loading patients...</Text>
              </Stack>
            ) : filteredPatients.length === 0 ? (
              <Card withBorder p="xl" ta="center">
                <Text c="dimmed">No patients found.</Text>

                <Button mt="md" onClick={() => setShowForm(true)}>
                  Add First Patient
                </Button>
              </Card>
            ) : (
              <Table.ScrollContainer minWidth={900}>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Patient</Table.Th>

                      <Table.Th>Age</Table.Th>

                      <Table.Th>Gender</Table.Th>

                      <Table.Th>Blood Group</Table.Th>

                      <Table.Th>Phone</Table.Th>

                      <Table.Th>Registered</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Card>
        </div>
      </main>

      {/* Add Patient Modal */}

      <Modal
        opened={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Patient"
        centered
        size="lg"
      >
        <PatientForm
          onSuccess={() => {
            setShowForm(false);
            fetchPatients();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

export default Patients;
