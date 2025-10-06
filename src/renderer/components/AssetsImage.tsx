import { appApiUrl } from 'main/sentient-sims/constants';

export interface AssetsImageProps {
  name: string;

  width?: number | string | undefined;

  height?: number | string | undefined;
}

export function AssetsImage({ name, width, height }: AssetsImageProps) {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img src={`${appApiUrl}/files/${name}`} width={width} height={height} />
  );
}
