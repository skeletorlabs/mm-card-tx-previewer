import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import { ChevronDownIcon } from "@heroicons/react/16/solid";
import classNames from "classnames";

type DropdownProps = {
  title: string;
  items: {
    name: string;
    symbol?: string;
  }[];
  selected: string;
  onSelect: (e: string) => void;
};

// export default function Dropdown({ title, items }: DropdownProps) {
//   return (
//     <Menu>
//       <MenuButton>{title}</MenuButton>
//       <MenuItems anchor="bottom">
//         {items.map((item, index) => (
//           <MenuItem key={index}>
//             <span className="block data-focus:bg-blue-100">{item.name}</span>
//           </MenuItem>
//         ))}
//       </MenuItems>
//     </Menu>
//   );
// }

export default function Dropdown({
  title,
  items,
  selected,
  onSelect,
}: DropdownProps) {
  return (
    <div className="flex flex-col gap-2 mt-4 w-full">
      <label htmlFor="amount" className="text-white/70">
        {title}
      </label>
      <div className="w-full">
        <Menu>
          <MenuButton className="inline-flex justify-between items-center w-full gap-2 rounded-md px-3 py-1.5 text-sm/6 font-semibold border border-white/70 text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-black/10 data-open:bg-black/10">
            {selected}
            <ChevronDownIcon className="size-4 fill-white/60" />
          </MenuButton>

          <MenuItems
            transition
            anchor="bottom start"
            className="min-w-[180px] origin-top-right rounded-xl border border-white/5 bg-black/10 backdrop-blur-md p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
          >
            {items.map((item, index) => (
              <MenuItem key={index}>
                <button
                  onClick={() => onSelect(item.name)}
                  className={classNames({
                    "group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10":
                      true,
                    "bg-white/10": item.name === selected.split(" - ")[0],
                  })}
                >
                  {/* <PencilIcon className="size-4 fill-white/30" /> */}
                  {item.name}
                  <kbd
                    className={classNames({
                      "ml-auto hidden font-sans text-xs text-white/50 group-data-focus:inline":
                        true,
                      inline: item.name === selected.split(" - ")[0],
                    })}
                  >
                    {item?.symbol}
                  </kbd>
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
