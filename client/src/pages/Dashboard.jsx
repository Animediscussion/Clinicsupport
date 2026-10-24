import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Card,
  Center,
  Container,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconUsers,
  IconStethoscope,
  IconCalendar,
  IconCircleCheck,
  IconCircleX,
  IconRefresh,
  IconAlertCircle,
  IconClock,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusColor = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "completed":
      return "teal";
    case "cancelled":
      return "red";
    case "pending":
      return "yellow";
    case "confirmed":
      return "blue";
    default:
      return "gray";
  }
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card
    withBorder
    radius="lg"
    padding="lg"
    style={{
      transition: "transform 180ms ease, box-shadow 180ms ease",
    }}
  >
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <Box style={{ minWidth: 0 }}>
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>

        <Title order={2} mt={10} fw={700}>
          {value ?? 0}
        </Title>
      </Box>

      <ThemeIcon size={48} radius="md" variant="light" color={color}>
        <Icon size={25} stroke={1.7} />
      </ThemeIcon>
    </Group>
  </Card>
);

const SectionCard = ({ title, description, children, action }) => (
  <Card withBorder radius="lg" padding="lg" h="100%">
    <Group justify="space-between" align="flex-start" mb="lg">
      <Box>
        <Title order={4}>{title}</Title>
        {description && (
          <Text size="sm" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
      </Box>
      {action}
    </Group>

    {children}
  </Card>
);

const EmptyState = ({ message }) => (
  <Center py={35}>
    <Stack align="center" gap="xs">
      <ThemeIcon size={46} radius="xl" variant="light" color="gray">
        <IconCalendar size={23} />
      </ThemeIcon>
      <Text size="sm" c="dimmed" ta="center">
        {message}
      </Text>
    </Stack>
  </Center>
);

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await API.get("/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboard) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Skeleton height={35} width={220} radius="md" />
          <Skeleton height={18} width={300} radius="md" />

          <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 5 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={115} radius="lg" />
            ))}
          </SimpleGrid>

          <Skeleton height={280} radius="lg" />
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Skeleton height={280} radius="lg" />
            <Skeleton height={280} radius="lg" />
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  if (error && !dashboard) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Unable to load dashboard"
          color="red"
          radius="lg"
        >
          <Stack gap="sm">
            <Text size="sm">{error}</Text>
            <Group>
              <ActionIcon
                variant="light"
                color="red"
                size="lg"
                onClick={fetchDashboard}
                aria-label="Retry loading dashboard"
              >
                <IconRefresh size={18} />
              </ActionIcon>
              <Text
                size="sm"
                fw={600}
                style={{ cursor: "pointer" }}
                onClick={fetchDashboard}
              >
                Try again
              </Text>
            </Group>
          </Stack>
        </Alert>
      </Container>
    );
  }

  if (!dashboard) return null;

  const stats = dashboard.stats || {};
  const todayAppointments = dashboard.todayAppointments || [];
  const upcomingAppointments = dashboard.upcomingAppointments || [];
  const recentPatients = dashboard.recentPatients || [];

  const statCards = [
    {
      title: "Active Patients",
      value: stats.totalPatients,
      icon: IconUsers,
      color: "blue",
    },
    {
      title: "Active Doctors",
      value: stats.totalDoctors,
      icon: IconStethoscope,
      color: "violet",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: IconCalendar,
      color: "cyan",
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      icon: IconCircleCheck,
      color: "teal",
    },
    {
      title: "Cancelled",
      value: stats.cancelledAppointments,
      icon: IconCircleX,
      color: "red",
    },
  ];

  return (
    <Box bg="var(--mantine-color-body)" mih="100vh" py="xl">
      <Container size="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Box>
              <Title order={2} fw={800}>
                Clinic Dashboard
              </Title>
              <Text c="dimmed" size="sm" mt={5}>
                Monitor your clinic's activity and appointments.
              </Text>
            </Box>

            <Tooltip label="Refresh dashboard">
              <ActionIcon
                variant="light"
                size="xl"
                radius="md"
                onClick={fetchDashboard}
                loading={loading}
                aria-label="Refresh dashboard"
              >
                <IconRefresh size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {error && (
            <Alert
              color="yellow"
              icon={<IconAlertCircle size={18} />}
              radius="md"
              title="Refresh issue"
            >
              {error}
            </Alert>
          )}

          {/* Statistics */}
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 5 }}>
            {statCards.map((item) => (
              <StatCard key={item.title} {...item} />
            ))}
          </SimpleGrid>

          {/* Today's appointments */}
          <SectionCard
            title="Today's Appointments"
            description={`${todayAppointments.length} scheduled appointment(s)`}
          >
            {todayAppointments.length === 0 ? (
              <EmptyState message="No appointments scheduled for today." />
            ) : (
              <Table.ScrollContainer minWidth={720}>
                <Table
                  striped
                  highlightOnHover
                  verticalSpacing="md"
                  horizontalSpacing="md"
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Time</Table.Th>
                      <Table.Th>Patient</Table.Th>
                      <Table.Th>Doctor</Table.Th>
                      <Table.Th>Reason</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {todayAppointments.map((appointment) => (
                      <Table.Tr key={appointment._id}>
                        <Table.Td>
                          <Group gap={6} wrap="nowrap">
                            <IconClock
                              size={16}
                              color="var(--mantine-color-dimmed)"
                            />
                            <Text size="sm" fw={500}>
                              {appointment.appointmentTime || "—"}
                            </Text>
                          </Group>
                        </Table.Td>

                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {appointment.patient?.name || "N/A"}
                          </Text>
                        </Table.Td>

                        <Table.Td>
                          <Text size="sm">
                            {appointment.doctor?.name
                              ? `Dr. ${appointment.doctor.name}`
                              : "N/A"}
                          </Text>
                        </Table.Td>

                        <Table.Td>
                          <Text size="sm" c="dimmed" lineClamp={1}>
                            {appointment.reason || "—"}
                          </Text>
                        </Table.Td>

                        <Table.Td>
                          <Badge
                            color={statusColor(appointment.status)}
                            variant="light"
                            radius="sm"
                          >
                            {appointment.status || "Unknown"}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </SectionCard>

          {/* Upcoming appointments and recent patients */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <SectionCard
              title="Upcoming Appointments"
              description="Your next scheduled visits"
            >
              {upcomingAppointments.length === 0 ? (
                <EmptyState message="No upcoming appointments." />
              ) : (
                <Stack gap="sm">
                  {upcomingAppointments.map((appointment) => (
                    <Card
                      key={appointment._id}
                      withBorder
                      radius="md"
                      padding="md"
                    >
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                      >
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                          <Avatar color="blue" radius="md">
                            <IconUser size={20} />
                          </Avatar>

                          <Box style={{ minWidth: 0 }}>
                            <Text fw={600} size="sm" lineClamp={1}>
                              {appointment.patient?.name || "N/A"}
                            </Text>

                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {appointment.doctor?.name
                                ? `Dr. ${appointment.doctor.name}`
                                : "Doctor not assigned"}
                            </Text>
                          </Box>
                        </Group>

                        <Box ta="right" style={{ flexShrink: 0 }}>
                          <Text size="sm" fw={600}>
                            {formatDate(appointment.appointmentDate)}
                          </Text>
                          <Text size="xs" c="dimmed" mt={3}>
                            {appointment.appointmentTime || "Time TBD"}
                          </Text>
                        </Box>
                      </Group>

                      <Group justify="flex-end" mt="sm">
                        <Badge
                          color={statusColor(appointment.status)}
                          variant="light"
                          size="sm"
                        >
                          {appointment.status || "Scheduled"}
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </SectionCard>

            <SectionCard
              title="Recent Patients"
              description="Latest patient registrations"
            >
              {recentPatients.length === 0 ? (
                <EmptyState message="No patients registered yet." />
              ) : (
                <Table.ScrollContainer minWidth={360}>
                  <Table verticalSpacing="md" horizontalSpacing="xs">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Patient</Table.Th>
                        <Table.Th>Phone</Table.Th>
                        <Table.Th>Gender</Table.Th>
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      {recentPatients.map((patient) => (
                        <Table.Tr key={patient._id}>
                          <Table.Td>
                            <Group gap="sm" wrap="nowrap">
                              <Avatar color="teal" radius="xl" size="sm">
                                {patient.name?.charAt(0)?.toUpperCase() || "P"}
                              </Avatar>

                              <Box>
                                <Text size="sm" fw={600}>
                                  {patient.name || "N/A"}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {patient.patientId || "No patient ID"}
                                </Text>
                              </Box>
                            </Group>
                          </Table.Td>

                          <Table.Td>
                            <Group gap={5} wrap="nowrap">
                              {patient.phone && (
                                <IconPhone
                                  size={14}
                                  color="var(--mantine-color-dimmed)"
                                />
                              )}
                              <Text size="sm">{patient.phone || "—"}</Text>
                            </Group>
                          </Table.Td>

                          <Table.Td>
                            <Text size="sm" tt="capitalize">
                              {patient.gender || "—"}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </SectionCard>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
