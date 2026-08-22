import { SimpleGrid, Card, Text, Title, Group } from "@mantine/core";

import {
  IconUsers,
  IconStethoscope,
  IconCalendar,
  IconFileInvoice,
} from "@tabler/icons-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const statistics = [
  {
    title: "Total Patients",
    value: "1,250",
    icon: IconUsers,
    color: "blue",
  },
  {
    title: "Doctors",
    value: "85",
    icon: IconStethoscope,
    color: "green",
  },
  {
    title: "Appointments",
    value: "42",
    icon: IconCalendar,
    color: "orange",
  },
  {
    title: "Pending Bills",
    value: "18",
    icon: IconFileInvoice,
    color: "red",
  },
];

function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main style={{ flex: 1 }}>
        <Navbar />

        <div style={{ padding: "24px" }}>
          <Title order={2} mb="xl">
            Dashboard
          </Title>

          <SimpleGrid
            cols={{
              base: 1,
              sm: 2,
              lg: 4,
            }}
          >
            {statistics.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} withBorder shadow="sm" padding="lg">
                  <Group justify="space-between">
                    <div>
                      <Text c="dimmed" size="sm">
                        {item.title}
                      </Text>

                      <Text fw={700} size="xl" mt="xs">
                        {item.value}
                      </Text>
                    </div>

                    <Icon
                      size={35}
                      color={`var(--mantine-color-${item.color}-6)`}
                    />
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
