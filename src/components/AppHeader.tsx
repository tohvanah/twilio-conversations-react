import { Avatar } from "./Avatar";
import { Text } from "@twilio-paste/core";
import { Menu, MenuButton, useMenuState, MenuItem } from "@twilio-paste/menu";
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import React, { useMemo, useState } from "react";
import styles from "../styles";
import { Client, ConnectionState, User } from "@twilio/conversations";
import UserProfileModal from "./modals/UserProfileModal";
import { readUserProfile } from "../api";
import { AppLogo, LOGO_SUB_TITLE, LOGO_TITLE } from "../branding";
import { useSelector } from "react-redux";
import { AppState } from "../store";
import { getTranslation } from "./../utils/localUtils";

type AppHeaderProps = {
  user: string;
  onSignOut: () => void;
  connectionState: ConnectionState;
  client?: Client;
};
const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onSignOut,
  connectionState,
  client,
}) => {
  const menu = useMenuState();

  const [showUserProfileModal, setUserProfileModal] = useState(false);

  const [userProfile, setUserProfile] = useState<User | undefined>(undefined);

  const handleUserProfileModalClose = () => setUserProfileModal(false);

  const local = useSelector((state: AppState) => state.local);
  const online = getTranslation(local, "online");
  const connecting = getTranslation(local, "connecting");
  const offline = getTranslation(local, "offline");
  const signout = getTranslation(local, "signout");
  const userProfileTxt = getTranslation(local, "userProfileTxt");

  const label: "online" | "connecting" | "offline" = useMemo(() => {
    switch (connectionState) {
      case "connected":
        return "online";
      case "connecting":
        return "connecting";
      default:
        return "offline";
    }
  }, [connectionState]);

  const handleUserProfileModalOpen = async () => {
    const userProfileTemp = await readUserProfile(user, client);
    setUserProfile(userProfileTemp);
    setUserProfileModal(true);
  };

  const hoffLogo = `<svg width="100%" height="100%" viewBox="0 0 126 126" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 62.781 0 C 28.164 0 0 28.164 0 62.781 C 0 97.399 28.164 125.562 62.781 125.562 C 97.399 125.562 125.562 97.399 125.562 62.781 C 125.562 28.164 97.397 0 62.781 0 Z M 118.503 61.3 C 118.301 60.789 117.969 60.326 117.506 59.968 C 116.943 59.532 103.549 49.249 89.981 44.868 C 89.353 44.666 88.675 44.666 88.047 44.868 C 87.203 45.14 86.36 45.438 85.52 45.754 C 77.414 26.163 66.592 9.782 65.475 8.114 C 65.201 7.674 64.824 7.319 64.387 7.063 C 93.899 7.904 117.727 31.772 118.503 61.3 Z M 45.656 76.761 C 52.978 73.295 59.455 68.97 62.778 66.604 C 66.048 68.938 72.519 73.277 79.901 76.766 C 74.09 90.917 66.662 103.619 62.779 109.887 C 58.897 103.617 51.469 90.913 45.656 76.761 Z M 34.363 63.639 C 35.281 66.899 36.352 70.155 37.524 73.361 C 37.198 73.481 36.873 73.619 36.548 73.732 C 28.206 70.848 19.92 65.605 15.365 62.46 C 19.893 59.341 28.237 54.056 36.55 51.181 C 36.947 51.318 37.342 51.485 37.738 51.632 C 36.483 55.021 35.335 58.469 34.365 61.921 C 34.205 62.483 34.205 63.078 34.363 63.639 Z M 40.708 62.781 C 41.547 59.89 42.526 56.998 43.583 54.135 C 49.307 56.898 54.477 60.208 57.732 62.455 C 54.458 64.708 49.184 68.085 43.379 70.876 C 42.4 68.191 41.493 65.484 40.708 62.781 Z M 79.682 48.259 C 72.449 51.708 66.07 55.969 62.781 58.309 C 59.543 55.997 53.168 51.723 45.879 48.253 C 51.657 34.319 58.946 21.863 62.779 15.674 C 66.615 21.863 73.906 34.323 79.682 48.259 Z M 67.831 62.46 C 71.066 60.233 76.256 56.91 81.981 54.14 C 83.038 57.003 84.015 59.892 84.854 62.781 C 84.07 65.488 83.162 68.196 82.183 70.88 C 76.377 68.098 71.124 64.735 67.831 62.46 Z M 91.199 61.919 C 90.229 58.467 89.081 55.021 87.826 51.632 C 88.223 51.485 88.617 51.318 89.014 51.181 C 97.355 54.065 105.643 59.308 110.197 62.453 C 105.669 65.572 97.325 70.857 89.014 73.732 C 88.688 73.619 88.363 73.481 88.037 73.361 C 89.209 70.155 90.281 66.899 91.199 63.638 C 91.357 63.074 91.357 62.481 91.199 61.919 Z M 61.165 7.061 C 60.717 7.328 60.329 7.698 60.055 8.16 C 58.785 10.062 48.08 26.328 40.043 45.751 C 39.202 45.436 38.36 45.14 37.514 44.868 C 36.885 44.666 36.208 44.666 35.579 44.868 C 22.659 49.042 9.759 58.669 8.121 59.915 C 7.807 60.145 7.531 60.438 7.312 60.787 C 7.21 60.95 7.128 61.119 7.059 61.293 C 7.839 31.771 31.662 7.907 61.165 7.061 Z M 7.04 63.576 C 7.24 64.101 7.581 64.578 8.055 64.945 C 8.618 65.381 22.012 75.664 35.581 80.045 C 35.895 80.147 36.222 80.196 36.548 80.196 C 36.875 80.196 37.201 80.145 37.515 80.045 C 38.282 79.798 39.048 79.527 39.813 79.245 C 47.943 99.082 58.96 115.763 60.087 117.446 C 60.361 117.887 60.74 118.241 61.175 118.498 C 31.435 117.652 7.463 93.42 7.04 63.576 Z M 64.396 118.499 C 64.844 118.233 65.231 117.862 65.505 117.401 C 66.788 115.481 77.688 98.915 85.748 79.243 C 86.511 79.526 87.278 79.798 88.045 80.045 C 88.359 80.147 88.686 80.196 89.012 80.196 C 89.339 80.196 89.665 80.145 89.98 80.045 C 102.899 75.871 115.8 66.244 117.438 64.998 C 117.752 64.768 118.029 64.475 118.247 64.126 C 118.356 63.95 118.445 63.768 118.517 63.581 C 118.094 93.42 94.129 117.646 64.396 118.499 Z" fill="#008EC5"/>
    </svg>`;

  return (
    <div style={styles.appHeader}>
      <div style={styles.flexCenter}>
        <div
          style={styles.appLogoWrapper}
          dangerouslySetInnerHTML={{ __html: hoffLogo }}
        ></div>
        <div style={styles.appLogoTitle}>{LOGO_TITLE}</div>
      </div>
      <div style={styles.userTile}>
        {!window.isAdminMonitor ? <Avatar name={user} /> : null}
        <div
          style={{
            padding: "0 10px",
          }}
        >
          {!window.isAdminMonitor ? (
            <Text as="span" style={styles.userName}>
              {user}
            </Text>
          ) : null}
          <Text
            as="span"
            color={
              label === "online"
                ? "colorTextPrimaryWeak"
                : label === "connecting"
                ? "colorTextIconBusy"
                : "colorTextWeaker"
            }
            style={styles.userStatus}
          >
            {label === "online"
              ? online
              : label === "connecting"
              ? `${connecting}...`
              : offline}
          </Text>
        </div>
        {0 ? (
          <MenuButton {...menu} variant="link" size="reset">
            <ChevronDownIcon
              color="colorTextInverse"
              decorative={false}
              title="Settings"
            />
          </MenuButton>
        ) : null}
        {0 ? (
          <Menu {...menu} aria-label="Preferences">
            <MenuItem {...menu} onClick={onSignOut}>
              {signout}
            </MenuItem>
            <MenuItem {...menu} onClick={handleUserProfileModalOpen}>
              {userProfileTxt}
            </MenuItem>
          </Menu>
        ) : null}
      </div>
      {showUserProfileModal && (
        <UserProfileModal
          isModalOpen={showUserProfileModal}
          handleClose={handleUserProfileModalClose}
          user={userProfile}
        ></UserProfileModal>
      )}
    </div>
  );
};

export default AppHeader;
