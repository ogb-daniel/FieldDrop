import { Menu } from "lucide-react";
interface HeaderProps {
  onMenuClick: (e: React.MouseEvent<SVGSVGElement>) => void;
}
export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <div className=" px-6 py-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <Menu
          className="block md:hidden cursor-pointer"
          onClick={onMenuClick}
        />
        <h1 className="text-2xl font-bold tracking-wide">FieldDrop</h1>
      </div>
    </div>
  );
};
