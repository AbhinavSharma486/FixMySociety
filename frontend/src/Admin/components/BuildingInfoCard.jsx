import React from "react";
import { HoverEffect, Card, CardTitle, CardDescription } from "../components/ui/card-hover-effect";

const items = [
  {
    title: "Item One",
    description: "This is the first item",
    link: "/item-one"
  },
  {
    title: "Item Two",
    description: "This is the second item",
    link: "/item-two"
  },
  {
    title: "Item One",
    description: "This is the first item",
    link: "/item-one"
  },
  {
    title: "Item Two",
    description: "This is the second item",
    link: "/item-two"
  },
  {
    title: "Item One",
    description: "This is the first item",
    link: "/item-one"
  },
  {
    title: "Item Two",
    description: "This is the second item",
    link: "/item-two"
  }
];

export default function BuildingInfoCard() {
  return (
    <main>
      <HoverEffect items={items} />
    </main>
  );
}
