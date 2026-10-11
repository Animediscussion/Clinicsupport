import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  SimpleGrid,
  Text,
  Title,
  Group,
  Badge,
  Table,
  Loader,
  Center,
  Stack,
} from "@mantine/core";

import {
  IconUsers,
  IconStethoscope,
  IconCalendar,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await API.get("/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h={300}>
        <Text c="red">{error}</Text>
      </Center>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { stats, todayAppointments, upcomingAppointments, recentPatients } =
    dashboard;

  const statCards = [
    {
      title: "Active Patients",
      value: stats.totalPatients,
      icon: IconUsers,
    },
    {
      title: "Active Doctors",
      value: stats.totalDoctors,
      icon: IconStethoscope,
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: IconCalendar,
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      icon: IconCircleCheck,
    },
    {
      title: "Cancelled",
      value: stats.cancelledAppointments,
      icon: IconCircleX,
    },
  ];

  return (
    <Stack gap="xl">
      <div>
        <Title order={2}>Dashboard</Title>

        <Text c="dimmed" mt={4}>
          Overview of your clinic
        </Text>
      </div>

      {/* Statistics */}
      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,
          md: 3,
          lg: 5,
        }}
      >
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              withBorder
              shadow="sm"
              padding="lg"
              radius="md"
            >
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">
                    {item.title}
                  </Text>

                  <Text fw={700} size="xl" mt={5}>
                    {item.value}
                  </Text>
                </div>

                <Icon size={28} stroke={1.6} />
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Today's appointments */}
      <Card withBorder shadow="sm" radius="md">
        <Title order={4} mb="md">
          Today's Appointments
        </Title>

        {todayAppointments.length === 0 ? (
          <Text c="dimmed">No appointments scheduled for today.</Text>
        ) : (
          <Table.ScrollContainer minWidth={700}>
            <Table striped highlightOnHover>
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
                    <Table.Td>{appointment.appointmentTime}</Table.Td>

                    <Table.Td>{appointment.patient?.name || "N/A"}</Table.Td>

                    <Table.Td>{appointment.doctor?.name || "N/A"}</Table.Td>

                    <Table.Td>{appointment.reason || "-"}</Table.Td>

                    <Table.Td>
                      <Badge
                        color={
                          appointment.status === "completed" ? "green" : "blue"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {/* Upcoming + recent patients */}
      <SimpleGrid
        cols={{
          base: 1,
          md: 2,
        }}
      >
        {/* Upcoming appointments */}
        <Card withBorder shadow="sm" radius="md">
          <Title order={4} mb="md">
            Upcoming Appointments
          </Title>

          {upcomingAppointments.length === 0 ? (
            <Text c="dimmed">No upcoming appointments.</Text>
          ) : (
            <Stack gap="sm">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment._id} withBorder padding="sm">
                  <Group justify="space-between">
                    <div>
                      <Text fw={600}>{appointment.patient?.name || "N/A"}</Text>

                      <Text size="sm" c="dimmed">
                        Dr. {appointment.doctor?.name || "N/A"}
                      </Text>
                    </div>

                    <div>
                      <Text size="sm" fw={500}>
                        {appointment.appointmentDate}
                      </Text>

                      <Text size="sm" c="dimmed">
                        {appointment.appointmentTime}
                      </Text>
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Card>

        {/* Recent patients */}
        <Card withBorder shadow="sm" radius="md">
          <Title order={4} mb="md">
            Recent Patients
          </Title>

          {recentPatients.length === 0 ? (
            <Text c="dimmed">No patients registered yet.</Text>
          ) : (
            <Table>
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
                      <Text fw={500}>{patient.name}</Text>

                      <Text size="xs" c="dimmed">
                        {patient.patientId}
                      </Text>
                    </Table.Td>

                    <Table.Td>{patient.phone || "-"}</Table.Td>

                    <Table.Td>{patient.gender || "-"}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Card>
      </SimpleGrid>
    </Stack>
  );
};

export default Dashboard;
