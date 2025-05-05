
import {
  Banknote,
  GanttChartSquare,
  Gift,
  Home,
  PackageOpen,
  PieChart,
  Receipt,
  Users,
  CalendarX2
} from "lucide-react";

export const sidebarItems = [
  {
    icon: Home,
    label: "Dashboard",
    link: "/",
  },
  {
    icon: GanttChartSquare,
    label: "Arreglos",
    link: "/arreglos",
  },
  {
    icon: Gift,
    label: "Gift Cards",
    link: "/gift-cards",
  },
  {
    icon: PackageOpen,
    label: "Stock",
    link: "/stock",
  },
  {
    icon: Banknote,
    label: "Gastos",
    link: "/gastos",
  },
  {
    icon: Users,
    label: "Empleados",
    link: "/empleados",
  },
  {
    icon: CalendarX2,
    label: "Ausencias",
    link: "/ausencias",
  },
  {
    icon: PieChart,
    label: "Resultados",
    link: "/resultados",
    restricted: true,
  },
  {
    icon: Receipt,
    label: "Facturación",
    link: "/facturacion",
    restricted: true,
  },
];
