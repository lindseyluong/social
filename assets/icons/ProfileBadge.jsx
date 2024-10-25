import * as React from "react";
import Svg, { Rect, Circle, Line } from "react-native-svg";

const ProfileBadgeIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={props.width || 24}
    height={props.height || 24}
    fill="none"
    {...props}
  >
    {/* Outer rounded rectangle representing the badge */}
    <Rect
      x={2}
      y={3}
      width={20}
      height={18}
      rx={3}
      stroke={props.color || "#000"}
      strokeWidth={2}
    />
    
    {/* Circular placeholder for profile picture */}
    <Circle
      cx={8}
      cy={10}
      r={3}
      stroke={props.color || "#000"}
      strokeWidth={2}
    />

    {/* Three horizontal lines representing text */}
    <Line
      x1={14}
      y1={8}
      x2={20}
      y2={8}
      stroke={props.color || "#000"}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Line
      x1={14}
      y1={12}
      x2={20}
      y2={12}
      stroke={props.color || "#000"}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Line
      x1={14}
      y1={16}
      x2={20}
      y2={16}
      stroke={props.color || "#000"}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default ProfileBadgeIcon;
