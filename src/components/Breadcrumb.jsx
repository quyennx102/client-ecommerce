import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ paths = [] }) => {
  // Nếu paths rỗng thì không render
  if (!paths.length) return null;

  const lastIndex = paths.length - 1;
  const current = paths[lastIndex]?.label || "";

  return (
    <div className="breadcrumb py-26 bg-main-two-50">
      <div className="container container-lg">
        <div className="breadcrumb-wrapper flex-between flex-wrap gap-16">
          {/* Tiêu đề là phần tử cuối cùng */}
          <h6 className="mb-0">{current}</h6>

          <ul className="flex-align gap-8 flex-wrap">
            {/* Home */}
            <li className="text-sm">
              <Link
                to="/"
                className="text-gray-900 flex-align gap-8 hover-text-main-600"
              >
                <i className="ph ph-house" />
                Home
              </Link>
            </li>

            {/* Các cấp tiếp theo */}
            {paths.map((item, idx) => (
              <React.Fragment key={idx}>
                <li className="flex-align">
                  <i className="ph ph-caret-right" />
                </li>

                <li className="text-sm">
                  {idx === lastIndex ? (
                    <span className="text-main-600">{item.label}</span>
                  ) : item.to ? (
                    <Link
                      to={item.to}
                      className="text-gray-900 hover-text-main-600"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900">{item.label}</span>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
