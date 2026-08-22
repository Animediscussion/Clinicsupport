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
  IconStethoscope,
} from "@tabler/icons-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    address: "",
  });

  const [formLoading, setFormLoading] = useState(false);

  // --------------------------------------------------
  // Fetch doctors
  // --------------------------------------------------

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/doctors");

      setDoctors(response.data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);

      setError(error.response?.data?.message || "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // --------------------------------------------------
  // Form handling
  // --------------------------------------------------

  const handleFormChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCreateDoctor = async (event) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setError("");

      await api.post("/doctors", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        specialization: form.specialization,
        qualification: form.qualification,
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        address: form.address,
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        qualification: "",
        experience: "",
        consultationFee: "",
        address: "",
      });

      setShowForm(false);

      await fetchDoctors();
    } catch (error) {
      console.error("Failed to create doctor:", error);

      setError(error.response?.data?.message || "Failed to create doctor.");
    } finally {
      setFormLoading(false);
    }
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return "-";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --------------------------------------------------
  // Specialization options
  // --------------------------------------------------

  const specializations = [
    ...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)),
  ];

  const specializationOptions = [
    {
      value: "all",
      label: "All Specializations",
    },
    ...specializations.map((specialization) => ({
      value: specialization,
      label: specialization,
    })),
  ];

  // --------------------------------------------------
  // Filter doctors
  // --------------------------------------------------

  const filteredDoctors = doctors.filter((doctor) => {
    const searchValue = search.toLowerCase();

    const doctorName = doctor.name?.toLowerCase() || "";

    const doctorEmail = doctor.email?.toLowerCase() || "";

    const specialization = doctor.specialization?.toLowerCase() || "";

    const matchesSearch =
      doctorName.includes(searchValue) ||
      doctorEmail.includes(searchValue) ||
      specialization.includes(searchValue);

    const matchesSpecialization =
      specializationFilter === "all" ||
      doctor.specialization === specializationFilter;

    return matchesSearch && matchesSpecialization;
  });

  // --------------------------------------------------
  // Table rows
  // --------------------------------------------------

  const rows = filteredDoctors.map((doctor) => (
    <Table.Tr key={doctor._id}>
      <Table.Td>
        <Group gap="sm">
          <IconStethoscope size={20} color="var(--mantine-color-blue-6)" />

          <div>
            <Text fw={600}>{doctor.name}</Text>

            <Text size="xs" c="dimmed">
              {doctor.email || "-"}
            </Text>
          </div>
        </Group>
      </Table.Td>

      <Table.Td>
        <Badge variant="light" color="blue">
          {doctor.specialization || "General"}
        </Badge>
      </Table.Td>

      <Table.Td>{doctor.qualification || "-"}</Table.Td>

      <Table.Td>
        {doctor.experience !== undefined ? `${doctor.experience} years` : "-"}
      </Table.Td>

      <Table.Td>{doctor.phone || "-"}</Table.Td>

      <Table.Td>{formatCurrency(doctor.consultationFee)}</Table.Td>
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
              <Title order={2}>Doctors</Title>

              <Text c="dimmed" size="sm">
                Manage doctors and medical staff
              </Text>
            </div>

            <Group>
              <Button
                variant="light"
                leftSection={<IconRefresh size={18} />}
                onClick={fetchDoctors}
              >
                Refresh
              </Button>

              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setShowForm(true)}
              >
                Add Doctor
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
                <IconStethoscope
                  size={32}
                  color="var(--mantine-color-blue-6)"
                />

                <div>
                  <Text size="sm" c="dimmed">
                    Total Doctors
                  </Text>

                  <Text fw={700} size="xl">
                    {doctors.length}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder shadow="sm">
              <Group>
                <IconStethoscope
                  size={32}
                  color="var(--mantine-color-green-6)"
                />

                <div>
                  <Text size="sm" c="dimmed">
                    Specializations
                  </Text>

                  <Text fw={700} size="xl">
                    {specializations.length}
                  </Text>
                </div>
              </Group>
            </Card>

            <Card withBorder shadow="sm">
              <Group>
                <IconStethoscope
                  size={32}
                  color="var(--mantine-color-orange-6)"
                />

                <div>
                  <Text size="sm" c="dimmed">
                    Showing
                  </Text>

                  <Text fw={700} size="xl">
                    {filteredDoctors.length}
                  </Text>
                </div>
              </Group>
            </Card>
          </SimpleGrid>

          {/* Doctor List */}

          <Card withBorder shadow="sm" radius="md">
            <Group justify="space-between" mb="md">
              <Title order={4}>Doctor List</Title>

              <Group>
                <TextInput
                  placeholder="Search doctors..."
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />

                <Select
                  placeholder="Specialization"
                  value={specializationFilter}
                  onChange={(value) => setSpecializationFilter(value || "all")}
                  data={specializationOptions}
                  w={200}
                />
              </Group>
            </Group>

            {loading ? (
              <Stack align="center" justify="center" p="xl">
                <Loader />

                <Text c="dimmed">Loading doctors...</Text>
              </Stack>
            ) : filteredDoctors.length === 0 ? (
              <Card withBorder p="xl" ta="center">
                <Text c="dimmed">No doctors found.</Text>

                <Button mt="md" onClick={() => setShowForm(true)}>
                  Add First Doctor
                </Button>
              </Card>
            ) : (
              <Table.ScrollContainer minWidth={1000}>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Doctor</Table.Th>

                      <Table.Th>Specialization</Table.Th>

                      <Table.Th>Qualification</Table.Th>

                      <Table.Th>Experience</Table.Th>

                      <Table.Th>Phone</Table.Th>

                      <Table.Th>Consultation Fee</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Card>
        </div>
      </main>

      {/* Add Doctor Modal */}

      <Modal
        opened={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Doctor"
        centered
        size="lg"
      >
        <form onSubmit={handleCreateDoctor}>
          <Stack>
            <TextInput
              label="Doctor Name"
              placeholder="Dr. John Smith"
              value={form.name}
              onChange={(event) =>
                handleFormChange("name", event.currentTarget.value)
              }
              required
            />

            <TextInput
              label="Email"
              type="email"
              placeholder="doctor@example.com"
              value={form.email}
              onChange={(event) =>
                handleFormChange("email", event.currentTarget.value)
              }
              required
            />

            <TextInput
              label="Phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={(event) =>
                handleFormChange("phone", event.currentTarget.value)
              }
              required
            />

            <Select
              label="Specialization"
              placeholder="Select specialization"
              searchable
              data={[
                "General Physician",
                "Cardiologist",
                "Dermatologist",
                "Neurologist",
                "Orthopedic",
                "Pediatrician",
                "Gynecologist",
                "Dentist",
                "ENT Specialist",
                "Ophthalmologist",
                "Psychiatrist",
                "Radiologist",
                "Surgeon",
              ]}
              value={form.specialization}
              onChange={(value) => handleFormChange("specialization", value)}
              required
            />

            <TextInput
              label="Qualification"
              placeholder="MBBS, MD"
              value={form.qualification}
              onChange={(event) =>
                handleFormChange("qualification", event.currentTarget.value)
              }
              required
            />

            <TextInput
              label="Experience"
              placeholder="10"
              type="number"
              value={form.experience}
              onChange={(event) =>
                handleFormChange("experience", event.currentTarget.value)
              }
              required
            />

            <TextInput
              label="Consultation Fee"
              placeholder="500"
              type="number"
              value={form.consultationFee}
              onChange={(event) =>
                handleFormChange("consultationFee", event.currentTarget.value)
              }
              required
            />

            <Textarea
              label="Address"
              placeholder="Doctor's address"
              minRows={3}
              value={form.address}
              onChange={(event) =>
                handleFormChange("address", event.currentTarget.value)
              }
            />

            <Group justify="flex-end" mt="md">
              <Button
                type="button"
                variant="default"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>

              <Button type="submit" loading={formLoading}>
                Add Doctor
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}

export default Doctors;
