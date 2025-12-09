"use client"

import * as React from "react"
import {
  User2,
  LayoutGrid
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import AppLogo from "./app-logo"
import { IconDashboard } from "@tabler/icons-react"

// This is sample data.
const data = {

  // navMain: [
  //   {
  //     title: "Playground",
  //     url: "#",
  //     icon: SquareTerminal,
  //     isActive: true,
  //     items: [
  //       {
  //         title: "History",
  //         url: "#",
  //       },
  //       {
  //         title: "Starred",
  //         url: "#",
  //       },
  //       {
  //         title: "Settings",
  //         url: "#",
  //       },
  //     ],
  //   }
  // ],
  projects: [
    {
      name: "Dashboard",
      url: "",
      icon: LayoutGrid,
    },
    {
      name: "Profile",
      url: "profile",
      icon: User2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Récupérer la session de l'utilisateur connecté
  const { data: session, isPending } = useSession();

  // Préparer les données utilisateur pour le composant NavUser
  const userData = session?.user ? {
    id: session.user.id,
    name: session.user.name || "User",
    email: session.user.email,
    image: session.user.image || "/avatars/default.jpg",
  } : null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={'/'} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : userData ? (
          <NavUser user={userData} />
        ) : (
          <div className="p-4 text-sm text-gray-500">Non connecté</div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
