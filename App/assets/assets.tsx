// import React from 'react';
// import { SvgUri } from 'react-native-svg';
// import { Asset } from 'expo-asset';

// const NavGOLogo = ({
//   width = 180,
//   height = 80,
// }: {
//   width?: number;
//   height?: number;
// }) => {
//   const asset = Asset.fromModule(require('./NavGO.png'));

//   return (
//     React.createElement(SvgUri, {
//       uri: asset.uri,
//       width,
//       height,
//     })
//   );
// };

// export { NavGOLogo };
import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface NavGOLogoProps {
  width?: number;
  height?: number;
}

const NavGOLogo: React.FC<NavGOLogoProps> = ({
  width = 180,
  height = 80,
}) => {
  return (
    <Image
      source={require('./NavGO.png')}
      style={[styles.logo, { width, height }]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    // Styling properties if needed
  },
});

export { NavGOLogo };