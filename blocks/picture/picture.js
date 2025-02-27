export default function init(block) {
  const { children } = block;

  Array.from(children).forEach((row, index) => {
    row.classList.add('picture-row');
    row.dataset.pictureRow = index;
    const columns = row.children;
    const mobilePicture = columns[0]?.querySelector('picture');
    const tabletPicture = columns[1]?.querySelector('picture');

    const desktopPicture = columns[2]?.querySelector('picture');
    mobilePicture?.classList.add('image-mobile');
    tabletPicture?.classList.add('image-tablet');
    desktopPicture?.classList.add('image-desktop');
  });
}
