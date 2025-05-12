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

export default function Dropdown({
  title,
  items,
  selected,
  onSelect,
}: DropdownProps) {
  return (
    <div className="flex flex-col mt-4">
      <label htmlFor="amount" className="text-white/70">
        {title}
      </label>

      <Menu>
        <MenuButton className="inline-flex justify-between items-center gap-2 text-[16px] font-semibold text-white focus:not-data-focus:outline-none data-focus:outline">
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
  );
}
