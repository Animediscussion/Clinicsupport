import { useEffect, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

import {
  IconAlertCircle,
  IconCalendarPlus,
  IconRefresh,
} from "@tabler/icons-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AppointmentForm from "../components/AppointmentForm";

import api from "../services/api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/appointments");

      setAppointments(response.data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);

      setError(error.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "blue";

      case "Completed":
        return "green";

      case "Cancelled":
        return "red";

      case "Pending":
        return "yellow";

      default:
        return "gray";
    }
  };

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

  const filteredAppointments =
    statusFilter === "all"
      ? appointments
      : appointments.filter(
          (appointment) => appointment.status === statusFilter,
        );

  const rows = filteredAppointments.map((appointment) => (
    <Table.Tr key={appointment._id}>
      <Table.Td>
        <Text fw={500}>{appointment.patient?.name || "Unknown Patient"}</Text>
      </Table.Td>

      <Table.Td>{appointment.doctor?.name || "Unknown Doctor"}</Table.Td>

      <Table.Td>{formatDate(appointment.date)}</Table.Td>

      <Table.Td>{appointment.time || "-"}</Table.Td>

      <Table.Td>{appointment.reason || "-"}</Table.Td>

      <Table.Td>
        <Badge color={getStatusColor(appointment.status)} variant="light">
          {appointment.status || "Pending"}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1 }}>
        <Navbar />

        <div style={{ padding: "24px" }}>
          <Group justify="space-between" mb="xl">
            <div>
              <Title order={2}>Appointments</Title>

              <Text c="dimmed" size="sm">
                Manage patient appointments
              </Text>
            </div>

            <Group>
              <Button
                variant="light"
                leftSection={<IconRefresh size={18} />}
                onClick={fetchAppointments}
              >
                Refresh
              </Button>

              <Button
                leftSection={<IconCalendarPlus size={18} />}
                onClick={() => setShowForm(true)}
              >
                New Appointment
              </Button>
            </Group>
          </Group>

          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />} mb="md">
              {error}
            </Alert>
          )}

          <Card withBorder shadow="sm" radius="md">
            <Group justify="space-between" mb="md">
              <Title order={4}>Appointment List</Title>

              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || "all")}
                data={[
                  {
                    value: "all",
                    label: "All",
                  },
                  {
                    value: "Scheduled",
                    label: "Scheduled",
                  },
                  {
                    value: "Pending",
                    label: "Pending",
                  },
                  {
                    value: "Completed",
                    label: "Completed",
                  },
                  {
                    value: "Cancelled",
                    label: "Cancelled",
                  },
                ]}
                w={180}
              />
            </Group>

            {loading ? (
              <Stack align="center" justify="center" p="xl">
                <Loader />

                <Text c="dimmed">Loading appointments...</Text>
              </Stack>
            ) : filteredAppointments.length === 0 ? (
              <Paper withBorder p="xl" ta="center">
                <Text c="dimmed">No appointments found.</Text>

                <Button mt="md" onClick={() => setShowForm(true)}>
                  Schedule First Appointment
                </Button>
              </Paper>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Patient</Table.Th>

                      <Table.Th>Doctor</Table.Th>

                      <Table.Th>Date</Table.Th>

                      <Table.Th>Time</Table.Th>

                      <Table.Th>Reason</Table.Th>

                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Card>
        </div>
      </main>

      <Modal
        opened={showForm}
        onClose={() => setShowForm(false)}
        title="Schedule Appointment"
        size="lg"
        centered
      >
        <AppointmentForm
          onSuccess={() => {
            setShowForm(false);
            fetchAppointments();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

export default Appointments;
