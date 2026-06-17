import { appApiUrl } from 'main/sentient-sims/constants';

export interface AssetsImageProps {
  name: string;

  width?: number | string | undefined;

  height?: number | string | undefined;
}

export function AssetsImage({ name, width, height }: AssetsImageProps) {
  return <img src={`${appApiUrl}/files/${name}`} width={width} height={height} alt={name} />;
}
