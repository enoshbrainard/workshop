import Chip from "@mui/material/Chip";

const roleStyles = {
  Admin: {
    bgcolor: "#0f3d62",
    color: "#f7fbff",
    borderColor: "rgba(15, 61, 98, 0.22)"
  },
  Manager: {
    bgcolor: "#d7e7f5",
    color: "#17486d",
    borderColor: "rgba(46, 98, 140, 0.24)"
  },
  Employee: {
    bgcolor: "#eef3f8",
    color: "#476173",
    borderColor: "rgba(96, 112, 128, 0.24)"
  }
};

const staffStyles = {
  direct: {
    bgcolor: "#e4f3ec",
    color: "#1f6a51",
    borderColor: "rgba(31, 122, 90, 0.22)"
  },
  indirect: {
    bgcolor: "#f8ecda",
    color: "#8d5b15",
    borderColor: "rgba(183, 121, 31, 0.24)"
  }
};

const sharedSx = {
  fontWeight: 700,
  borderWidth: 1,
  borderStyle: "solid"
};

const StatusChip = ({ type, value, label, ...props }) => {
  let palette = {
    bgcolor: "#eef3f8",
    color: "#476173",
    borderColor: "rgba(96, 112, 128, 0.24)"
  };

  if (type === "role") {
    palette = roleStyles[value] || palette;
  }

  if (type === "staff") {
    palette = value ? staffStyles.direct : staffStyles.indirect;
  }

  return <Chip label={label} sx={{ ...sharedSx, ...palette }} {...props} />;
};

export default StatusChip;
