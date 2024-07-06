import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Menu } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

const MenuTree = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [current, setCurrent] = useState('HOME');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get('http://appnox-tm.it/api/v1/menu/tree', {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`
          }
        });

        const { data } = response.data.result;
        console.log('Fetched Items:', data);

        const menuStructure = buildMenuStructure(data);
        console.log('Menu Items:', menuStructure);

        setMenuItems(menuStructure);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch menu tree:', err);
        setError('Failed to fetch menu tree.');
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const buildMenuStructure = (items, parentId = 0) => {
    if (!Array.isArray(items)) {
      console.error('Expected an array of items, got:', items);
      return [];
    }

    return items
      .filter(item => item.parentId === parentId)
      .map(item => ({
        key: item.menuId.toString(),
        icon: item.type === 'Image' ? <AppstoreOutlined /> : null,
        title: item.item,
        children: item.children && item.children.length > 0 ? buildMenuStructure(item.children, item.menuId) : undefined,
      }));
  };

  const handleClick = (e) => {
    setCurrent(e.key);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Menu Tree</h1>
      <Menu
        onClick={handleClick}
        style={{ width: 256 }}
        defaultSelectedKeys={['HOME']}
        selectedKeys={[current]}
        mode="inline"
        theme="dark"
      >
        {menuItems.map(item => (
          item.children ? (
            <Menu.SubMenu key={item.key} title={item.title} icon={item.icon}>
              {renderSubMenuItems(item.children)}
            </Menu.SubMenu>
          ) : (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.title}
            </Menu.Item>
          )
        ))}
      </Menu>
    </div>
  );
};

const renderSubMenuItems = (children) => (
  children.map(child => (
    child.children ? (
      <Menu.SubMenu key={child.key} title={child.title} icon={child.icon}>
        {renderSubMenuItems(child.children)}
      </Menu.SubMenu>
    ) : (
      <Menu.Item key={child.key} icon={child.icon}>
        {child.title}
      </Menu.Item>
    )
  ))
);

export default MenuTree;
