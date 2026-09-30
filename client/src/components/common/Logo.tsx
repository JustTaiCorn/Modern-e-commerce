import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center">
      <Image
        src="https://pos.nvncdn.com/f4d87e-8901/store/20151119_gvSbVoXmL33ZboSGXwazkWXV.jpg?v=1673230469"
        alt="Logo"
        width={100}
        height={40}
        priority
        className="h-auto w-auto object-contain"
      />
    </div>
  );
}
