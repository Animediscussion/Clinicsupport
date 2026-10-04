import { useEffect, useMemo, useState } from "react";

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";

import { IconCheck, IconX, IconSearch, IconRefresh } from "@tabler/icons-react";

import api from "../services/api";

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cancelOpened, setCancelOpened] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ==========================================
  // Fetch appointments
  // ==========================================
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/appointments");

      setAppointments(response.data);
    } catch (err) {
      console.error("Fetch appointments error:", err);

      setError(err.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ==========================================
  // Update appointment status
  // ==========================================
  const updateStatus = async (appointmentId, status) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.put(`/appointments/${appointmentId}`, {
        status,
      });

      setSuccess(`Appointment marked as ${status.replace("-", " ")}.`);

      await fetchAppointments();
    } catch (err) {
      console.error("Update status error:", err);

      setError(err.response?.data?.message || "Failed to update appointment.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Cancel appointment
  // ==========================================
  const handleCancel = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.patch(`/appointments/${selectedAppointment._id}/cancel`);

      setCancelOpened(false);
      setSelectedAppointment(null);

      setSuccess("Appointment cancelled successfully.");

      await fetchAppointments();
    } catch (err) {
      console.error("Cancel appointment error:", err);

      setError(err.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Filter appointments
  // ==========================================
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const patientName = appointment.patient?.name?.toLowerCase() || "";

      const patientId = appointment.patient?.patientId?.toLowerCase() || "";

      const doctorName = appointment.doctor?.name?.toLowerCase() || "";

      const searchValue = search.toLowerCase();

      const matchesSearch =
        patientName.includes(searchValue) ||
        patientId.includes(searchValue) ||
        doctorName.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;

      const matchesDate =
        !dateFilter || appointment.appointmentDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  // ==========================================
  // Status badge
  // ==========================================
  const getStatusColor = (status) => {
    const colors = {
      scheduled: "blue",
      completed: "green",
      cancelled: "red",
      "no-show": "orange",
    };

    return colors[status] || "gray";
  };

  const formatStatus = (status) => {
    return status
      ?.replace("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ==========================================
  // Render
  // ==========================================
  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Appointments</Title>

          <Text size="sm" c="dimmed">
            View and manage clinic appointments.
          </Text>
        </div>

        <Button
          variant="light"
          leftSection={<IconRefresh size={17} />}
          onClick={fetchAppointments}
          loading={loading}
        >
          Refresh
        </Button>
      </Group>

      {/* Alerts */}
      {error && (
        <Alert color="red" withCloseButton onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" withCloseButton onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <Group align="end">
          <TextInput
            style={{ flex: 1 }}
            label="Search"
            placeholder="Patient name, patient ID or doctor..."
            leftSection={<IconSearch size={17} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />

          <Select
            label="Status"
            placeholder="Filter status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            data={[
              { value: "all", label: "All statuses" },
              { value: "scheduled", label: "Scheduled" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
              { value: "no-show", label: "No-show" },
            ]}
            w={180}
          />

          <TextInput
            label="Appointment Date"
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.currentTarget.value)}
            w={180}
          />

          <Button
            variant="default"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDateFilter("");
            }}
          >
            Clear Filters
          </Button>
        </Group>
      </Paper>

      {/* Appointment table */}
      <Paper withBorder radius="md">
        <Group justify="space-between" p="md">
          <Text fw={600}>Appointment Records</Text>

          <Badge variant="light" color="blue">
            {filteredAppointments.length} appointments
          </Badge>
        </Group>

        <Table.ScrollContainer minWidth={1000}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Doctor</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {loading && appointments.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Group justify="center" p="xl">
                      <Loader size="sm" />
                      <Text c="dimmed">Loading appointments...</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ) : filteredAppointments.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text ta="center" c="dimmed" py="xl">
                      No appointments found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredAppointments.map((appointment) => {
                  const isScheduled = appointment.status === "scheduled";

                  return (
                    <Table.Tr key={appointment._id}>
                      <Table.Td>{appointment.appointmentDate}</Table.Td>

                      <Table.Td>
                        <Text fw={600}>{appointment.appointmentTime}</Text>
                      </Table.Td>

                      <Table.Td>
                        <Text fw={500}>
                          {appointment.patient?.name || "Unknown"}
                        </Text>

                        <Text size="xs" c="dimmed">
                          {appointment.patient?.patientId || "-"}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text fw={500}>
                          {appointment.doctor?.name || "Unknown"}
                        </Text>

                        <Text size="xs" c="dimmed">
                          {appointment.doctor?.specialization || "-"}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Tooltip
                          label={appointment.reason || "No reason provided"}
                        >
                          <Text size="sm" lineClamp={1} maw={160}>
                            {appointment.reason || "-"}
                          </Text>
                        </Tooltip>
                      </Table.Td>

                      <Table.Td>
                        <Badge color={getStatusColor(appointment.status)}>
                          {formatStatus(appointment.status)}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        {isScheduled ? (
                          <Group gap="xs">
                            <Tooltip label="Mark completed">
                              <ActionIcon
                                color="green"
                                variant="light"
                                onClick={() =>
                                  updateStatus(appointment._id, "completed")
                                }
                                disabled={loading}
                              >
                                <IconCheck size={17} />
                              </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Mark no-show">
                              <ActionIcon
                                color="orange"
                                variant="light"
                                onClick={() =>
                                  updateStatus(appointment._id, "no-show")
                                }
                                disabled={loading}
                              >
                                <IconX size={17} />
                              </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Cancel appointment">
                              <ActionIcon
                                color="red"
                                variant="light"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setCancelOpened(true);
                                }}
                                disabled={loading}
                              >
                                <IconX size={17} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        ) : (
                          <Text size="xs" c="dimmed">
                            No actions
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* Cancel confirmation */}
      <Modal
        opened={cancelOpened}
        onClose={() => {
          setCancelOpened(false);
          setSelectedAppointment(null);
        }}
        title="Cancel Appointment"
        centered
      >
        <Stack>
          <Text>Are you sure you want to cancel this appointment?</Text>

          {selectedAppointment && (
            <Paper withBorder p="sm">
              <Text fw={600}>{selectedAppointment.patient?.name}</Text>

              <Text size="sm" c="dimmed">
                {selectedAppointment.doctor?.name}
              </Text>

              <Text size="sm" c="dimmed">
                {selectedAppointment.appointmentDate} at{" "}
                {selectedAppointment.appointmentTime}
              </Text>
            </Paper>
          )}

          <Text size="sm" c="dimmed">
            The appointment record will be retained, but its time slot will
            become available for booking again.
          </Text>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelOpened(false)}>
              Keep Appointment
            </Button>

            <Button color="red" loading={loading} onClick={handleCancel}>
              Confirm Cancellation
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default AppointmentList;
