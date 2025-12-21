export const IMAGES = {
  "image1.png": require("../assets/images/image1.png"),
  "image2.png": require("../assets/images/image2.png"),
  "image3.png": require("../assets/images/image3.png"),
  "image4.png": require("../assets/images/image4.png"),
  "image5.png": require("../assets/images/image5.png"),
  "image6.png": require("../assets/images/image6.png"),
  "image7.png": require("../assets/images/image7.png"),
  "image8.png": require("../assets/images/image8.png"),
  "index1.jpg": require("../assets/images/index1.jpg"),
  "index2.jpg": require("../assets/images/index2.jpg"),
  "index3.jpg": require("../assets/images/index3.jpg"),
  "index4.jpg": require("../assets/images/index4.jpg"),
  "index5.jpg": require("../assets/images/index5.jpg"),
  "map.png": require("../assets/images/map.png"),
  "profile.jpg": require("../assets/images/profile.jpg"),
};

export function resolveImage(pathOrName) {
  if (!pathOrName) return null;

  const parts = pathOrName.split("/");
  const name = parts[parts.length - 1];

  if (pathOrName.startsWith("http://") || pathOrName.startsWith("https://")) {
    return { uri: pathOrName };
  }

  if (IMAGES[name]) return IMAGES[name];

  if (IMAGES[pathOrName]) return IMAGES[pathOrName];

  return null;
}
